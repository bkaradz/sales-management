import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import { orders, orders_details, contacts, products } from '$lib/server/drizzle/schema';
import type { Contacts, Orders, OrdersDetails, Products, } from '$lib/server/drizzle/schema';
import trim from 'lodash-es/trim';
import { addMany, subtractMany, type CalcPriceReturn, type PaymentStatus, type SalesStatus, type ProductionStatus } from '$lib/utility/calculateCart.util';
import { dinero, toSnapshot, type DineroSnapshot } from 'dinero.js';
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

export const getProductionOrders = async (input: SearchParams, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .where(
          and(eq(orders.active, true), 
          and(eq(products.product_category, 'Embroidery'), 
          and(ne(orders.sales_status, 'Quotation'), 
          ne(orders_details.production_status, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))

      ordersQuery = await db.select({ orders, contacts, orders_details, products }).from(orders)
        .where(
          and(eq(orders.active, true), 
          and(eq(products.product_category, 'Embroidery'), 
          and(ne(orders.sales_status, 'Quotation'), 
          ne(orders_details.production_status, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
        .orderBy(desc(orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .where(
          and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), 
          and(eq(orders.active, true), 
          and(eq(products.product_category, 'Embroidery'), 
          and(ne(orders.sales_status, 'Quotation'), 
          ne(orders_details.production_status, 'Collected'))))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))

      ordersQuery = await db.select({ orders, contacts, orders_details, products }).from(orders)
        .where(
          and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), 
          and(eq(orders.active, true), 
          and(eq(products.product_category, 'Embroidery'), 
          and(ne(orders.sales_status, 'Quotation'), 
          ne(orders_details.production_status, 'Collected'))))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
        .orderBy(desc(orders.id))
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
    console.error("🚀 ~ file: orders.drizzle.ts:72 ~ getOrders ~ error:", error)
  }
};

export const getOrdersByUserId = async (input: {
  limit?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
  id: number
}, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .where(and(eq(orders.active, true), eq(orders.customer_id, input.id)))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))

      ordersQuery = await db.select({ orders, contacts, orders_details }).from(orders)
        .where(and(eq(orders.active, true), eq(orders.customer_id, input.id)))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .orderBy(desc(orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), and(eq(orders.active, true), eq(orders.customer_id, input.id))))
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))

      ordersQuery = await db.select({ orders, contacts, orders_details }).from(orders)
        .where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), and(eq(orders.active, true), eq(orders.customer_id, input.id))))
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

export const getOrdersByProductId = async (input: {
  limit?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
  product_id: number
}, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .where(and(eq(orders.active, true), eq(orders_details.product_id, input.product_id)))

      ordersQuery = await db.select({ orders, contacts, orders_details }).from(orders)
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .where(and(eq(orders.active, true), eq(orders_details.product_id, input.product_id)))
        .orderBy(desc(orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders)
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), and(eq(orders.active, true), eq(orders_details.product_id, input.product_id))))

      ordersQuery = await db.select({ orders, contacts, orders_details }).from(orders)
        .innerJoin(contacts, eq(contacts.id, orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, orders.id))
        .where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), and(eq(orders.active, true), eq(orders_details.product_id, input.product_id))))
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

type OrderInput = { order: Pick<Orders, 'customer_id' | 'pricelist_id' | 'exchange_rates_id' | 'description' | 'delivery_date' | 'sales_status' | 'total_products' | 'sales_amount'>, orders_details: CalcPriceReturnSnapshot[] }

export const createOrder = async (input: OrderInput, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    /**
     * TODO: calculate first before saving
     */

    let paymentStatus: PaymentStatus = 'Awaiting Sales Order'

    if (!(input.order.sales_status === 'Quotation')) {
      paymentStatus = 'Awaiting Payment'
    }

    const orderResult = await db.insert(orders).values({ user_id: ctx.session.user.userId, ...input.order, payment_status: paymentStatus }).returning({ id: orders.id });

    if (input.orders_details) {
      input.orders_details.forEach(async (item) => {
        await db.insert(orders_details).values({ ...item, order_id: orderResult[0].id, total_price: item.total_price, unit_price: item.unit_price })
      })
    }

    if (!(input.order.sales_status === 'Quotation')) {
      const contact = await db.select().from(contacts).where(eq(contacts.id, input.order.customer_id))
      const totalBalance = addMany([dinero(input.order.sales_amount), dinero(contact[0].balance_due)])
      const totalReceipt = addMany([dinero(input.order.sales_amount), dinero(contact[0].total_receipts)])
      await db.update(contacts).set({ balance_due: toSnapshot(totalBalance), total_receipts: toSnapshot(totalReceipt) }).where(eq(contacts.id, input.order.customer_id))
    }


    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:102 ~ createOrder ~ error:", error)
  }

};

export const deleteById = async (input: { id: number, payment_status: PaymentStatus, sales_status: SalesStatus }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {
    if (input.sales_status === 'Cancelled') throw new Error("The order was Cancelled");

    let paymentStatus: PaymentStatus = 'Cancelled'

    if (input.payment_status === 'Paid') {
      paymentStatus = 'Refunded'
    }

    const orderResult = await db.update(orders)
      .set({ active: false, payment_status: paymentStatus, sales_status: 'Cancelled' })
      .where(eq(orders.id, input.id))
      .returning({ id: orders.id, sales_amount: orders.sales_amount, customer_id: orders.customer_id });

    if (input.sales_status === 'Quotation') return { message: "success", }

    if (input.payment_status === 'Paid') {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      const totalBalance = dinero(contact[0].balance_due)
      const totalReceipt = subtractMany([dinero(contact[0].total_receipts), dinero(orderResult[0].sales_amount)])
      await db.update(contacts).set({ balance_due: toSnapshot(totalBalance), total_receipts: toSnapshot(totalReceipt) })
        .where(eq(contacts.id, orderResult[0].customer_id))
    } else {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      const totalBalance = subtractMany([dinero(contact[0].balance_due), dinero(orderResult[0].sales_amount)])
      const totalReceipt = subtractMany([dinero(contact[0].total_receipts), dinero(orderResult[0].sales_amount)])
      await db.update(contacts).set({ balance_due: toSnapshot(totalBalance), total_receipts: toSnapshot(totalReceipt) })
        .where(eq(contacts.id, orderResult[0].customer_id))
    }

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:124 ~ deleteById ~ error:", error)
  }
};

export const changeSalesStatusById = async (input: { id: number, sales_status: string }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const salesStatus = input.sales_status as SalesStatus

    let paymentStatus: PaymentStatus = 'Awaiting Sales Order'

    if (!(input.sales_status === 'Quotation')) {
      paymentStatus = 'Awaiting Payment'
    }

    const orderResult = await db.update(orders)
      .set({ user_id: ctx.session.user.userId, sales_status: salesStatus, payment_status: paymentStatus })
      .where(eq(orders.id, input.id))
      .returning({ id: orders.id, sales_amount: orders.sales_amount, customer_id: orders.customer_id });

    if (!(input.sales_status === 'Quotation')) {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      const totalBalance = addMany([dinero(orderResult[0].sales_amount), dinero(contact[0].balance_due)])
      const totalReceipt = addMany([dinero(orderResult[0].sales_amount), dinero(contact[0].total_receipts)])
      await db.update(contacts).set({ balance_due: toSnapshot(totalBalance), total_receipts: toSnapshot(totalReceipt) }).where(eq(contacts.id, orderResult[0].customer_id))
    }

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:162 ~ changeSalesStatusById ~ error:", error)
  }
};

export const changeProductionStatusById = async (input: { id: number, sales_status: string, payment_status: PaymentStatus, production_status: ProductionStatus }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const salesStatus = input.sales_status as SalesStatus

    let paymentStatus: PaymentStatus = 'Awaiting Sales Order'

    if (!(input.sales_status === 'Quotation')) {
      paymentStatus = 'Awaiting Payment'
    }

    const orderResult = await db.update(orders)
      .set({ user_id: ctx.session.user.userId, sales_status: salesStatus, payment_status: paymentStatus })
      .where(eq(orders.id, input.id))
      .returning({ id: orders.id, sales_amount: orders.sales_amount, customer_id: orders.customer_id });

    if (!(input.sales_status === 'Quotation')) {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      const totalBalance = addMany([dinero(orderResult[0].sales_amount), dinero(contact[0].balance_due)])
      const totalReceipt = addMany([dinero(orderResult[0].sales_amount), dinero(contact[0].total_receipts)])
      await db.update(contacts).set({ balance_due: toSnapshot(totalBalance), total_receipts: toSnapshot(totalReceipt) }).where(eq(contacts.id, orderResult[0].customer_id))
    }

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