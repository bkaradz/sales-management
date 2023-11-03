import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { orders, orders_details, contacts, products } from '$lib/server/drizzle/schema';
import type { Contacts, Orders, OrdersDetails, Products, } from '$lib/server/drizzle/schema';
import trim from 'lodash-es/trim';
import type { CalcPriceReturn, SalesStatus } from '$lib/utility/calculateCart.util';
import type { DineroSnapshot } from 'dinero.js';
import { getById as getPricelistById } from "../pricelist/pricelists.drizzle";
import { getById as getContactById } from "../contacts/contacts.drizzle";
import { getById as getExchangeRateById } from "../exchangeRates/rates.drizzle";
import { pricelistToMapObj, type PricelistToMap, type ExchangeRateToMap, exchangeRateToMapObj } from '$lib/utility/monetary.util';

export const getOrders = async (input: SearchParams, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .where(eq(orders.active, true))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))

      ordersQuery = await db.select({ orders, contacts, orders_details }).from(orders)
        .where(eq(orders.active, true))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .orderBy(desc(orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), (eq(orders.active, true))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))

      ordersQuery = await db.select({ orders, contacts, orders_details }).from(orders)
        .where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), (eq(orders.active, true))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .orderBy(desc(orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = +totalOrdersRecords[0].count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    const result = ordersQuery.reduce<Record<number, { orders: Orders; contacts: Contacts; orders_details: OrdersDetails[] }>>(
      (acc, row) => {
        const orders = row.orders;
        const contacts = row.contacts;
        const orders_details = row.orders_details;

        if (!acc[orders.id]) acc[orders.id] = { orders, contacts, orders_details: [] };

        if (orders_details) acc[orders.id].orders_details.push(orders_details);

        return acc;
      }, {},
    );

    return {
      orders: Object.values(result),
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:72 ~ getOrders ~ error:", error)
  }
};

export type CalcPriceReturnSnapshot = Omit<CalcPriceReturn, 'total_price' | 'unit_price'> & { total_price: DineroSnapshot<number>, unit_price: DineroSnapshot<number> }

type OrderInput = { order: Pick<Orders, 'customer_id' | 'pricelist_id' | 'exchange_rates_id' | 'description' | 'delivery_date'| 'sales_status' | 'total_products' | 'sale_amount'>, orders_details: CalcPriceReturnSnapshot[] }

export const createOrder = async (input: OrderInput, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    /**
     * TODO: calculate first before saving
     */

    const orderResult = await db.insert(orders).values({ user_id: ctx.session.user.userId, ...input.order }).returning({ id: orders.id });

    if (input.orders_details) {
      input.orders_details.forEach(async (item) => {
        await db.insert(orders_details).values({ ...item, order_id: orderResult[0].id, total_price: item.total_price, unit_price: item.unit_price })
      })
    }
    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:102 ~ createOrder ~ error:", error)
  }

};

export const deleteById = async (input: number, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    await db.update(orders)
      .set({ active: false })
      .where(eq(orders.id, input));

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:124 ~ deleteById ~ error:", error)
  }
};

export const changeSalesStatusById = async (input: {id: number, sales_status: string}, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const salesStatus = input.sales_status as SalesStatus

    const contactResult = await db.update(orders)
			.set({ user_id: ctx.session.user.userId, sales_status: salesStatus })
			.where(eq(orders.id, input.id))
			.returning({ id: orders.id });

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:162 ~ changeSalesStatusById ~ error:", error)
  }
};

export const getById = async (input: number, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    let pricelistMap: PricelistToMap
    let exchangeRateMap: ExchangeRateToMap

    const ordersQuery = (await db.select().from(orders).where(and(eq(orders.active, true), eq(orders.id, input))))[0]
    if (!ordersQuery) throw new Error("Order not found");
    const customerQuery = await getContactById(ordersQuery.customer_id, ctx)
    if (!customerQuery) throw new Error("Customer not found");
    const pricelistQuery = await getPricelistById(ordersQuery.pricelist_id, ctx)
    if (!pricelistQuery) throw new Error("Pricelist not found");
    pricelistMap = pricelistToMapObj(pricelistQuery)
    const exchangeRateQuery = await getExchangeRateById(ordersQuery.exchange_rates_id, ctx)
    if (!exchangeRateQuery) throw new Error("Exchange rate not found");
    exchangeRateMap = exchangeRateToMapObj(exchangeRateQuery)
    const ordersDetailsQuery = await db.select().from(orders_details).where(eq(orders_details.order_id, input))
    const productsArray = ordersDetailsQuery.map((item) => item.product_id)
    // const productsQuery = await db.select().from(products).where(inArray(products.id, productsArray))
    const productsQuery = await db.select().from(products).where(sql`${products.id} IN ${productsArray}`)

    if (productsQuery.length === 0) throw new Error("Products not found");

    return {
      pricelist: pricelistMap,
      exchange_rate: exchangeRateMap,
      customer: customerQuery.contact,
      products: productsQuery,
      orders_details: ordersDetailsQuery,
      order: ordersQuery,
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:165 ~ getById ~ error:", error)
  }
};

export const updateOrder = async (input: any, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }


  return { success: true }

  try {



  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:216 ~ updateOrder ~ error:", error)
  }

};