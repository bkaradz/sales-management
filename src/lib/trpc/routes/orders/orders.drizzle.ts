import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { address, orders, emails, phones, type Orders, type Phones, type Emails, type Address, orders_details } from '$lib/server/drizzle/schema';
import trim from 'lodash-es/trim';
import normalizePhone from '$lib/utility/normalizePhone.util';
import type { CalcPriceReturn } from '$lib/utility/calculateCart.util';
import type {  DineroSnapshot } from 'dinero.js';

export const getOrders = async (input: SearchParams) => {

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.active, true))

      ordersQuery = await db.select().from(orders)
        .orderBy(asc(orders.full_name))
        .where(eq(orders.active, true))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `${input.search}:*`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        // .where(and((sql`${orders.full_name} % ${data}`), (eq(orders.active, true))));
        .where(and((sql`to_tsvector('simple', ${orders.full_name}) @@ plainto_tsquery('simple', ${data})`), (eq(orders.active, true))));

      ordersQuery = await db.select().from(orders)
        .orderBy(asc(orders.full_name))
        // .where(and((sql`${orders.full_name} % ${data}`), (eq(orders.active, true))))
        .where(and((sql`to_tsvector('simple', ${orders.full_name}) @@ plainto_tsquery('simple', ${data})`), (eq(orders.active, true))))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

    }

    pagination.totalRecords = +totalOrdersRecords[0].count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    return {
      orders: ordersQuery,
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:84 ~ getOrders ~ error:", error)
  }
};

export const getById = async (input: number) => {

  try {

    let ordersQuery: any[] = []

    ordersQuery = [...ordersQuery, ...(
      (await db.select({
        order: orders, phones
      }).from(orders)
        .leftJoin(phones, eq(orders.id, phones.order_id))
        .where(eq(orders.id, input)))
    )]
    ordersQuery = [...ordersQuery, ...(
      (await db.select({
        order: orders, address
      }).from(orders)
        .leftJoin(address, eq(orders.id, address.order_id))
        .where(eq(orders.id, input)))
    )]
    ordersQuery = [...ordersQuery, ...(
      (await db.select({
        order: orders, emails
      }).from(orders)
        .leftJoin(emails, eq(orders.id, emails.order_id))
        .where(eq(orders.id, input)))
    )]

    const result = ordersQuery.reduce<Record<number, { order: Orders; phones: Phones[]; emails: Emails[]; address: Address[] }>>(
      (acc, row) => {
        const order = row.order;
        const phones = row.phones;
        const emails = row.emails;
        const address = row.address;

        if (!acc[order.id]) acc[order.id] = { order, phones: [], emails: [], address: [] };

        if (phones) acc[order.id].phones.push(phones);

        if (emails) acc[order.id].emails.push(emails);

        if (address) acc[order.id].address.push(address);

        return acc;
      }, {},
    );

    return result[input]

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:84 ~ getOrders ~ error:", error)
  }
};


export const deleteById = async (input: number) => {

  try {

    await db.update(orders)
      .set({ active: false })
      .where(eq(orders.id, input));

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:84 ~ getOrders ~ error:", error)
  }
};

export type CalcPriceReturnSnapshot = Omit<CalcPriceReturn, 'total_price' | 'unit_price'> & {total_price: DineroSnapshot<number>, unit_price: DineroSnapshot<number>}


export const createOrder = async (input: { order: Pick<Orders, 'customer_id' | 'pricelist_id' | 'exchange_rates_id' | 'description' | 'delivery_date'>, orders_details: CalcPriceReturnSnapshot[] }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const orderResult = await db.insert(orders).values({ user_id: ctx.session.user.userId, ...input.order }).returning({ id: orders.id });

    if (input.orders_details) {
      input.orders_details.forEach(async (item) => {
        await db.insert(orders_details).values({ ...item, order_id: orderResult[0].id, total_price: item.total_price, unit_price: item.unit_price })
      })
    }
    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:143 ~ createOrder ~ error:", error)
  }

};

export const updateOrder = async (input: any, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const deleteWait = []

    // delete address, phone and email with order id from database then add new details
    deleteWait.push(await db.delete(phones).where(eq(phones.order_id, input.id)).returning({ id: phones.id }))
    deleteWait.push(await db.delete(emails).where(eq(emails.order_id, input.id)).returning({ id: emails.id }))
    deleteWait.push(await db.delete(address).where(eq(address.order_id, input.id)).returning({ id: address.id }))

    const allDeleted = await Promise.all(deleteWait)

    const orderResult = await db.update(orders)
      .set({ user_id: ctx.session.user.userId, updated_at: new Date(), vat_or_bp_number: input.vat_or_bp_number, full_name: input.full_name, active: true, is_corporate: (input?.is_corporate == 'on' ? true : false), })
      .where(eq(input.id, orders.id))
      .returning({ id: orders.id });

    if (input?.phone) {
      normalizePhone(input.phone).forEach(async (item: string) => {
        await db.insert(phones).values({ order_id: orderResult[0].id, phone: item.trim() }).onConflictDoNothing()
      })

    }

    if (input?.email) {
      input.email.split(',').forEach(async (item: string) => {
        await db.insert(emails).values({ order_id: orderResult[0].id, email: item.trim() }).onConflictDoNothing()
      })
    }

    if (input?.address) {
      input.address.split(',').forEach(async (item: string) => {
        await db.insert(address).values({ order_id: orderResult[0].id, address: item.trim() }).onConflictDoNothing()
      })
    }

    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:216 ~ updateOrder ~ error:", error)
  }

};