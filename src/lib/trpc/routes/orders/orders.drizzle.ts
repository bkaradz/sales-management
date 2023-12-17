import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { shop_orders, orders_details, contacts, products, transactions, transactions_details, payments } from '$lib/server/drizzle/schema/schema';
import type { Contacts, Orders, OrdersDetails } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';
import { addMany, subtractMany } from '$lib/utility/calculateCart.util';
import { getById as getPricelistById } from "../pricelist/pricelists.drizzle";
import { getById as getContactById } from "../contacts/contacts.drizzle";
import { getById as getExchangeRateById } from "../exchangeRates/rates.drizzle";
import type { PricelistToMap, ExchangeRateToMap } from '$lib/utility/monetary.util';
import { pricelistToMapObj, exchangeRateToMapObj } from '$lib/utility/monetary.util';
import type { PaymentStatusUnion, SalesStatusUnion } from '$lib/utility/lists.utility';
import type { SaveCartOrder } from '$lib/validation/cart.zod';


export const getOrdersLine = async (input: SearchParams, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(eq(shop_orders.active, true))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
        .innerJoin(contacts, eq(shop_orders.customer_id, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shop_orders_id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        full_name: contacts.full_name,
        contact_id: contacts.id,
        sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
        total_products: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(eq(shop_orders.active, true))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
        .innerJoin(contacts, eq(shop_orders.customer_id, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shop_orders_id))
        .orderBy(desc(shop_orders.id))

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), (eq(shop_orders.active, true))))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(shop_orders.customer_id, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shop_orders_id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        full_name: contacts.full_name,
        contact_id: contacts.id,
        sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
        total_products: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), (eq(shop_orders.active, true))))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
        .innerJoin(contacts, eq(shop_orders.customer_id, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shop_orders_id))
        .orderBy(desc(shop_orders.id))
    }

    pagination.totalRecords = totalOrdersRecords.length === 0 ? 0 : +totalOrdersRecords[0]?.count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    return {
      shop_orders: ordersQuery,
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:101 ~ getOrdersLine ~ error:", error)
  }
};

export const getOrdersByUserId = async (input: {
  limit?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
  id: number
}, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id)))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        full_name: contacts.full_name,
        contact_id: contacts.id,
        sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
        total_products: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id)))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id))))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        full_name: contacts.full_name,
        contact_id: contacts.id,
        sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
        total_products: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(shop_orders.customer_id, input.id))))
        .groupBy(contacts.full_name, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = totalOrdersRecords.length === 0 ? 0 : +totalOrdersRecords[0]?.count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    return {
      shop_orders: ordersQuery,
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:265 ~ error:", error)
  }
};

export const getOrdersAwaitingPaymentByUserId = async (input: {
  limit?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
  id: number
}, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
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

      ordersQuery = await db.select({
        id: shop_orders.id,
        user_id: shop_orders.user_id,
        customer_id: shop_orders.customer_id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        sales_amount: shop_orders.sales_amount,
        total_products: shop_orders.total_products,
        active: shop_orders.active,
      }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(shop_orders.customer_id, input.id),
              eq(shop_orders.payment_status, 'Awaiting Payment')
            )))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
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

      ordersQuery = await db.select({
        id: shop_orders.id,
        user_id: shop_orders.user_id,
        customer_id: shop_orders.customer_id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        sales_amount: shop_orders.sales_amount,
        total_products: shop_orders.total_products,
        active: shop_orders.active,
      }).from(shop_orders)
        .where(
          and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(shop_orders.customer_id, input.id),
                eq(shop_orders.payment_status, 'Awaiting Payment')
              ))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    pagination.totalRecords = totalOrdersRecords.length === 0 ? 0 : +totalOrdersRecords[0]?.count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    return {
      shop_orders: ordersQuery,
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:363 ~ error:", error)
  }
};

export const getOrdersByProductId = async (input: {
  limit?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
  product_id: number
}, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders_details)
        .where(and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id)))
        .groupBy(shop_orders.id, contacts.full_name, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shop_orders_id))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        full_name: contacts.full_name,
        contact_id: contacts.id,
        sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
        total_products: sql<string>`sum(${orders_details.quantity})`
      }).from(orders_details)
        .where(and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id)))
        .groupBy(shop_orders.id, contacts.full_name, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shop_orders_id))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders_details)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id))))
        .groupBy(shop_orders.id, contacts.full_name, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shop_orders_id))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelist_id: shop_orders.pricelist_id,
        exchange_rates_id: shop_orders.exchange_rates_id,
        sales_status: shop_orders.sales_status,
        payment_status: shop_orders.payment_status,
        full_name: contacts.full_name,
        contact_id: contacts.id,
        sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
        total_products: sql<string>`sum(${orders_details.quantity})`
      }).from(orders_details)
        .where(and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(orders_details.product_id, input.product_id))))
        .groupBy(shop_orders.id, contacts.full_name, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shop_orders_id))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
    }

    pagination.totalRecords = totalOrdersRecords.length === 0 ? 0 : +totalOrdersRecords[0]?.count
    pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

    if (pagination.endIndex >= pagination.totalRecords) {
      pagination.next = undefined;
    }

    return {
      shop_orders: ordersQuery,
      pagination
    }

  } catch (error) {
    console.error("🚀 ~ file: orders.drizzle.ts:379 ~ error:", error)
  }
};

export const createOrder = async (input: SaveCartOrder, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
  }

  try {

    /**
     * TODO: calculate first before saving
     */

    await db.transaction(async (tx) => {
      let paymentStatus: PaymentStatusUnion = 'Awaiting Sales Order'

      if (!(input.order.sales_status === 'Quotation')) {
        paymentStatus = 'Awaiting Payment'
      }

      const orderResult = await tx.insert(shop_orders).values({ user_id: ctx.session.user.userId, ...input.order, delivery_date: new Date(input.order.delivery_date), payment_status: paymentStatus }).returning({ id: shop_orders.id });

      await tx.transaction(async (tx2) => {
        if (input.orders_details) {
          input.orders_details.forEach(async (item) => {
            const productId = item.product_id
            if (!productId) throw new Error("Product Id not found");
            await tx2.insert(orders_details).values({ ...item, shop_orders_id: orderResult[0].id, product_id: productId })
          })
        }

        // create transaction

        if (!(input.order.sales_status === 'Quotation')) {
          await tx2.insert(transactions).values({
            user_id: ctx.session.user.userId,
            customer_id: input.order.customer_id,
            shop_orders_id: orderResult[0].id,
          })
        }

        // Update contact amount 

        if (!(input.order.sales_status === 'Quotation')) {

          const allShopOrdersTotals = await tx2.select({
            shop_orders_totals: sql<string>`sum(${shop_orders.sales_amount})`
          }).from(shop_orders)
            .where(
              and(
                and(eq(shop_orders.customer_id, input.order.customer_id), ne(shop_orders.sales_status, 'Quotation')),
                ne(shop_orders.sales_status, 'Cancelled')
              ))

          const ordersTotals = await tx2.select({
            shop_orders_totals: sql<string>`sum(${shop_orders.sales_amount})`
          }).from(shop_orders)
            .where(
              and(and(and(eq(shop_orders.customer_id, input.order.customer_id), ne(shop_orders.sales_status, 'Quotation')),
                ne(shop_orders.sales_status, 'Cancelled')
              ),
                ne(shop_orders.payment_status, 'Paid')
              ),
            )

          const allPaymentsTotals = await tx2.select({
            payments_totals: sql<string>`sum(${payments.cash_paid})`
          }).from(payments)
            .where(eq(payments.customer_id, input.order.customer_id))

          const amount = subtractMany([allPaymentsTotals[0].payments_totals, allShopOrdersTotals[0].shop_orders_totals])

          await tx2.update(contacts).set({ orders_totals: ordersTotals[0].shop_orders_totals, amount: amount.toString() }).where(eq(contacts.id, input.order.customer_id))
        }
      });
    });

    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:102 ~ createOrder ~ error:", error)
  }

};

export const deleteById = async (input: { id: number, payment_status: PaymentStatusUnion, sales_status: SalesStatusUnion }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
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

    await db.update(orders_details).set({ active: false }).where(eq(orders_details.shop_orders_id, input.id)).returning({ id: shop_orders.id });

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
    error(404, 'User not found');
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

export const getById = async (input: number, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
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
    const ordersDetailsQuery = await db.select().from(orders_details).where(eq(orders_details.shop_orders_id, input))
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