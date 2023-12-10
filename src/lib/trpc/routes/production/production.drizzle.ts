import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { shop_orders, orders_details, contacts, products, pricelist } from '$lib/server/drizzle/schema/schema';
import type { Contacts, Orders, OrdersDetails } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';
import { addMany, subtractMany, type CalcPriceReturn } from '$lib/utility/calculateCart.util';
import { getById as getPricelistById } from "../pricelist/pricelists.drizzle";
import { getById as getContactById } from "../contacts/contacts.drizzle";
import { getById as getExchangeRateById } from "../exchangeRates/rates.drizzle";
import { pricelistToMapObj, type PricelistToMap, type ExchangeRateToMap, exchangeRateToMapObj } from '$lib/utility/monetary.util';
import type { PaymentStatusUnion, ProductionStatusUnion, SalesStatusUnion } from '$lib/utility/lists.utility';
import type { SaveCartOrder } from '$lib/validation/cart.zod';


export const getProductionOrders = async (input: SearchParams, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(products.product_category, 'Embroidery'),
              and(ne(shop_orders.sales_status, 'Quotation'),
                ne(orders_details.production_status, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        order_id: shop_orders.id,
        full_name: contacts.full_name,
        contacts_id: contacts.id,
        products_name: products.name,
        products_id: products.id,
        order_stitches: orders_details.stitches,
        order_quantity: orders_details.quantity,
        order_garment_placement: orders_details.garment_placement,
        order_production_status: orders_details.production_status,
        order_sales_status: shop_orders.sales_status,
        order_payment_status: shop_orders.payment_status,
      }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(products.product_category, 'Embroidery'),
              and(ne(shop_orders.sales_status, 'Quotation'),
                ne(orders_details.production_status, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(
          and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(products.product_category, 'Embroidery'),
                and(ne(shop_orders.sales_status, 'Quotation'),
                  ne(orders_details.production_status, 'Collected'))))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        order_id: shop_orders.id,
        full_name: contacts.full_name,
        contacts_id: contacts.id,
        products_name: products.name,
        products_id: products.id,
        order_stitches: orders_details.stitches,
        order_quantity: orders_details.quantity,
        order_garment_placement: orders_details.garment_placement,
        order_production_status: orders_details.production_status,
        order_sales_status: shop_orders.sales_status,
        order_payment_status: shop_orders.payment_status,
      }).from(shop_orders)
        .where(
          and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(products.product_category, 'Embroidery'),
                and(ne(shop_orders.sales_status, 'Quotation'),
                  ne(orders_details.production_status, 'Collected'))))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = +totalOrdersRecords[0].count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    return {
      shop_orders: ordersQuery,
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:72 ~ getOrders ~ error:", error)
  }
};

export type GetProductionOrders = Awaited<ReturnType<typeof getProductionOrders>>


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

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id)))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))

      ordersQuery = await db.select({ shop_orders, contacts, orders_details }).from(shop_orders)
        .where(and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id)))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))

      ordersQuery = await db.select({ shop_orders, contacts, orders_details }).from(shop_orders)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = +totalOrdersRecords[0].count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    const result = ordersQuery.reduce<Record<number, { shop_orders: Orders; contacts: Contacts; orders_details: OrdersDetails[] }>>(
      (acc, row) => {
        const shop_orders = row.shop_orders;
        const contacts = row.contacts;
        const orders_details = row.orders_details;

        if (!acc[shop_orders.id]) acc[shop_orders.id] = { shop_orders, contacts, orders_details: [] };

        if (orders_details) acc[shop_orders.id].orders_details.push(orders_details);

        return acc;
      }, {},
    );

    return {
      shop_orders: Object.values(result),
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:72 ~ getOrders ~ error:", error)
  }
};

export const getOrdersAwaitingPaymentByUserId = async (input: {
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

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(shop_orders.customer_id, input.id),
              eq(shop_orders.payment_status, 'Awaiting Payment')
            )))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))

      ordersQuery = await db.select({ shop_orders, contacts, orders_details }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(shop_orders.customer_id, input.id),
              eq(shop_orders.payment_status, 'Awaiting Payment')
            )))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(
          and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(shop_orders.customer_id, input.id),
                eq(shop_orders.payment_status, 'Awaiting Payment')
              ))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))

      ordersQuery = await db.select({ shop_orders, contacts, orders_details }).from(shop_orders)
        .where(
          and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(shop_orders.customer_id, input.id),
                eq(shop_orders.payment_status, 'Awaiting Payment')
              ))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = +totalOrdersRecords[0].count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    const result = ordersQuery.reduce<Record<number, { shop_orders: Orders; contacts: Contacts; orders_details: OrdersDetails[] }>>(
      (acc, row) => {
        const shop_orders = row.shop_orders;
        const contacts = row.contacts;
        const orders_details = row.orders_details;

        if (!acc[shop_orders.id]) acc[shop_orders.id] = { shop_orders, contacts, orders_details: [] };

        if (orders_details) acc[shop_orders.id].orders_details.push(orders_details);

        return acc;
      }, {},
    );

    return {
      shop_orders: Object.values(result),
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:72 ~ getOrders ~ error:", error)
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

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .where(and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id)))

      ordersQuery = await db.select({ shop_orders, contacts, orders_details }).from(shop_orders)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .where(and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id)))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id))))

      ordersQuery = await db.select({ shop_orders, contacts, orders_details }).from(shop_orders)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id))))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = +totalOrdersRecords[0].count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    const result = ordersQuery.reduce<Record<number, { shop_orders: Orders; contacts: Contacts; orders_details: OrdersDetails[] }>>(
      (acc, row) => {
        const shop_orders = row.shop_orders;
        const contacts = row.contacts;
        const orders_details = row.orders_details;

        if (!acc[shop_orders.id]) acc[shop_orders.id] = { shop_orders, contacts, orders_details: [] };

        if (orders_details) acc[shop_orders.id].orders_details.push(orders_details);

        return acc;
      }, {},
    );

    return {
      shop_orders: Object.values(result),
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:72 ~ getOrders ~ error:", error)
  }
};

export type CalcPriceReturnSnapshot = CalcPriceReturn

type OrderInput = { order: Pick<Orders, 'customer_id' | 'pricelist_id' | 'exchange_rates_id' | 'description' | 'delivery_date' | 'sales_status' | 'total_products' | 'sales_amount'>, orders_details: CalcPriceReturnSnapshot[] }

export const createOrder = async (input: SaveCartOrder, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    /**
     * TODO: calculate first before saving
     */

    let paymentStatus: PaymentStatusUnion = 'Awaiting Sales Order'

    if (!(input.order.sales_status === 'Quotation')) {
      paymentStatus = 'Awaiting Payment'
    }

    const orderResult = await db.insert(shop_orders).values({ user_id: ctx.session.user.userId, ...input.order, delivery_date: new Date(input.order.delivery_date), payment_status: paymentStatus }).returning({ id: shop_orders.id });

    if (input.orders_details) {
      input.orders_details.forEach(async (item) => {
        const productId = item.product_id
        if (!productId) throw new Error("Product Id not found");
        await db.insert(orders_details).values({ ...item, order_id: orderResult[0].id, product_id: productId })
      })
    }

    if (!(input.order.sales_status === 'Quotation')) {
      const contact = await db.select().from(contacts).where(eq(contacts.id, input.order.customer_id))
      const ordersTotals = addMany([input.order.sales_amount, contact[0].orders_totals])
      await db.update(contacts).set({ orders_totals: ordersTotals.toString(), deposit: (-ordersTotals).toString() }).where(eq(contacts.id, input.order.customer_id))
    }


    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:102 ~ createOrder ~ error:", error)
  }

};

export const deleteById = async (input: { id: number, payment_status: PaymentStatusUnion, sales_status: SalesStatusUnion }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {
    if (input.sales_status === 'Cancelled') throw new Error("The order was Cancelled");

    let paymentStatus: PaymentStatusUnion = 'Cancelled'

    if (input.payment_status === 'Paid') {
      paymentStatus = 'Refunded'
    }

    const orderResult = await db.update(shop_orders)
      .set({ active: false, payment_status: paymentStatus, sales_status: 'Cancelled' })
      .where(eq(shop_orders.id, input.id))
      .returning({ id: shop_orders.id, sales_amount: shop_orders.sales_amount, customer_id: shop_orders.customer_id });

    await db.update(orders_details).set({ active: false }).where(eq(orders_details.order_id, input.id)).returning({ id: shop_orders.id });

    if (input.sales_status === 'Quotation') return { message: "success", }

    if (input.payment_status === 'Paid') {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      // Paid order totals was already removed
      const ordersTotals = contact[0].orders_totals
      const totalReceipt = subtractMany([contact[0].total_receipts, orderResult[0].sales_amount])
      await db.update(contacts).set({ orders_totals: ordersTotals, total_receipts: totalReceipt.toString() })
        .where(eq(contacts.id, orderResult[0].customer_id))
    } else {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      const ordersTotals = subtractMany([contact[0].orders_totals, orderResult[0].sales_amount])
      await db.update(contacts).set({ orders_totals: ordersTotals.toString() })
        .where(eq(contacts.id, orderResult[0].customer_id))
    }

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:124 ~ deleteById ~ error:", error)
  }
};

export const changeSalesStatusById = async (input: { id: number, sales_status: string }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    const salesStatus = input.sales_status as SalesStatusUnion

    let paymentStatus: PaymentStatusUnion = 'Awaiting Sales Order'

    if (!(input.sales_status === 'Quotation')) {
      paymentStatus = 'Awaiting Payment'
    }

    const orderResult = await db.update(shop_orders)
      .set({ user_id: ctx.session.user.userId, sales_status: salesStatus, payment_status: paymentStatus })
      .where(eq(shop_orders.id, input.id))
      .returning({ id: shop_orders.id, sales_amount: shop_orders.sales_amount, customer_id: shop_orders.customer_id });

    if (!(input.sales_status === 'Quotation')) {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customer_id))
      const ordersTotals = addMany([orderResult[0].sales_amount, contact[0].orders_totals])
      await db.update(contacts).set({ orders_totals: ordersTotals.toString() }).where(eq(contacts.id, orderResult[0].customer_id))
    }

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:162 ~ changeSalesStatusById ~ error:", error)
  }
};

export const changeProductionStatusById = async (input: { id: number, sales_status: string, payment_status: PaymentStatusUnion, production_status: ProductionStatusUnion }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    await db.update(orders_details).set({ production_status: input.production_status }).where(eq(orders_details.id, input.id))

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:162 ~ changeSalesStatusById ~ error:", error)
  }
};

export const getById = async (input: number, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    let pricelistMap: PricelistToMap
    let exchangeRateMap: ExchangeRateToMap

    const ordersQuery = (await db.select().from(shop_orders).where(and(eq(shop_orders.active, true), eq(shop_orders.id, input))))[0]
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
    console.error("🚀 ~ file: shop_orders.drizzle.ts:165 ~ getById ~ error:", error)
  }
};