import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/server/context"
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

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(eq(shop_orders.active, true))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
        .innerJoin(contacts, eq(shop_orders.customerId, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shopOrdersId))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        fullName: contacts.fullName,
        contactId: contacts.id,
        salesAmount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unitPrice}), '0')`,
        totalProducts: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(eq(shop_orders.active, true))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
        .innerJoin(contacts, eq(shop_orders.customerId, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shopOrdersId))
        .orderBy(desc(shop_orders.id))

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), (eq(shop_orders.active, true))))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(shop_orders.customerId, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shopOrdersId))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        fullName: contacts.fullName,
        contactId: contacts.id,
        salesAmount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unitPrice}), '0')`,
        totalProducts: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), (eq(shop_orders.active, true))))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
        .innerJoin(contacts, eq(shop_orders.customerId, contacts.id))
        .innerJoin(orders_details, eq(shop_orders.id, orders_details.shopOrdersId))
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

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and(eq(shop_orders.active, true), eq(shop_orders.customerId, input.id)))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        fullName: contacts.fullName,
        contactId: contacts.id,
        salesAmount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unitPrice}), '0')`,
        totalProducts: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(and(eq(shop_orders.active, true), eq(shop_orders.customerId, input.id)))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(shop_orders.customerId, input.id))))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        fullName: contacts.fullName,
        contactId: contacts.id,
        salesAmount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unitPrice}), '0')`,
        totalProducts: sql<string>`sum(${orders_details.quantity})`
      }).from(shop_orders)
        .where(and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(shop_orders.customerId, input.id))))
        .groupBy(contacts.fullName, shop_orders.id, contacts.id)
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
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

  if (!ctx?.session?.id) {
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
            and(eq(shop_orders.customerId, input.id),
              eq(shop_orders.paymentStatus, 'Awaiting Payment')
            )))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))

      ordersQuery = await db.select({
        id: shop_orders.id,
        userId: shop_orders.userId,
        customerId: shop_orders.customerId,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        salesAmount: shop_orders.salesAmount,
        totalProducts: shop_orders.totalProducts,
        active: shop_orders.active,
      }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(shop_orders.customerId, input.id),
              eq(shop_orders.paymentStatus, 'Awaiting Payment')
            )))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(
          and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(shop_orders.customerId, input.id),
                eq(shop_orders.paymentStatus, 'Awaiting Payment')
              ))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))

      ordersQuery = await db.select({
        id: shop_orders.id,
        userId: shop_orders.userId,
        customerId: shop_orders.customerId,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        salesAmount: shop_orders.salesAmount,
        totalProducts: shop_orders.totalProducts,
        active: shop_orders.active,
      }).from(shop_orders)
        .where(
          and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(shop_orders.customerId, input.id),
                eq(shop_orders.paymentStatus, 'Awaiting Payment')
              ))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
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

export type OrdersByUserId = NonNullable<Awaited<ReturnType<typeof getOrdersAwaitingPaymentByUserId>>>['shop_orders'][0]

export const getOrdersByProductId = async (input: {
  limit?: number | undefined;
  page?: number | undefined;
  search?: string | undefined;
  productId: number
}, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  const pagination = getPagination(input);

  try {

    let totalOrdersRecords
    let ordersQuery

    if (!trim(input.search)) {

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders_details)
        .where(and(eq(shop_orders.active, true), eq(orders_details.productId, input.productId)))
        .groupBy(shop_orders.id, contacts.fullName, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shopOrdersId))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        fullName: contacts.fullName,
        contactId: contacts.id,
        salesAmount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unitPrice}), '0')`,
        totalProducts: sql<string>`sum(${orders_details.quantity})`
      }).from(orders_details)
        .where(and(eq(shop_orders.active, true), eq(orders_details.productId, input.productId)))
        .groupBy(shop_orders.id, contacts.fullName, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shopOrdersId))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .orderBy(desc(shop_orders.id))
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders_details)
        .where(and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(orders_details.productId, input.productId))))
        .groupBy(shop_orders.id, contacts.fullName, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shopOrdersId))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))

      ordersQuery = await db.select({
        id: shop_orders.id,
        pricelistId: shop_orders.pricelistId,
        exchangeRatesId: shop_orders.exchangeRatesId,
        salesStatus: shop_orders.salesStatus,
        paymentStatus: shop_orders.paymentStatus,
        fullName: contacts.fullName,
        contactId: contacts.id,
        salesAmount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unitPrice}), '0')`,
        totalProducts: sql<string>`sum(${orders_details.quantity})`
      }).from(orders_details)
        .where(and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`), and(eq(shop_orders.active, true), eq(orders_details.productId, input.productId))))
        .groupBy(shop_orders.id, contacts.fullName, contacts.id)
        .innerJoin(shop_orders, eq(shop_orders.id, orders_details.shopOrdersId))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
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

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    /**
     * TODO: calculate first before saving
     */

    await db.transaction(async (tx) => {
      let paymentStatus: PaymentStatusUnion = 'Awaiting Sales Order'

      if (!(input.order.salesStatus === 'Quotation')) {
        paymentStatus = 'Awaiting Payment'
      }

      const orderResult = await tx.insert(shop_orders).values({ userId: ctx.session.user.userId, ...input.order, deliveryDate: new Date(input.order.deliveryDate), paymentStatus: paymentStatus }).returning({ id: shop_orders.id });

      await tx.transaction(async (tx2) => {
        if (input.orders_details) {
          input.orders_details.forEach(async (item) => {
            const productId = item.productId
            if (!productId) throw new Error("Product Id not found");
            await tx2.insert(orders_details).values({ ...item, shopOrdersId: orderResult[0].id, productId: productId })
          })
        }

        // create transaction

        if (!(input.order.salesStatus === 'Quotation')) {
          await tx2.insert(transactions).values({
            userId: ctx.session.user.userId,
            customerId: input.order.customerId,
            shopOrdersId: orderResult[0].id,
          })
        }

        // Update contact amount 

        if (!(input.order.salesStatus === 'Quotation')) {

          const allShopOrdersTotals = await tx2.select({
            shop_ordersTotals: sql<string>`sum(${shop_orders.salesAmount})`
          }).from(shop_orders)
            .where(
              and(
                and(eq(shop_orders.customerId, input.order.customerId), ne(shop_orders.salesStatus, 'Quotation')),
                ne(shop_orders.salesStatus, 'Cancelled')
              ))

          const ordersTotals = await tx2.select({
            shop_ordersTotals: sql<string>`sum(${shop_orders.salesAmount})`
          }).from(shop_orders)
            .where(
              and(and(and(eq(shop_orders.customerId, input.order.customerId), ne(shop_orders.salesStatus, 'Quotation')),
                ne(shop_orders.salesStatus, 'Cancelled')
              ),
                ne(shop_orders.paymentStatus, 'Paid')
              ),
            )

          const allPaymentsTotals = await tx2.select({
            payments_totals: sql<string>`sum(${payments.defaultCurrencyEquivalentTotal})`
          }).from(payments)
            .where(eq(payments.customerId, input.order.customerId))

          let amount = '0'

          const customers = await tx.select().from(contacts).where(eq(contacts.id, input.order.customerId))

          if (+customers[0].amount > 0) {
            amount = customers[0].amount
          } else {
            amount = subtractMany([(allPaymentsTotals[0].payments_totals || '0'), allShopOrdersTotals[0].shop_ordersTotals])
          }

          await tx2.update(contacts).set({ ordersTotals: ordersTotals[0].shop_ordersTotals, amount: amount.toString() }).where(eq(contacts.id, input.order.customerId))
        }
      });
    });

    return { success: true }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:102 ~ createOrder ~ error:", error)
  }

};

export const deleteById = async (input: { id: number, paymentStatus: PaymentStatusUnion, salesStatus: SalesStatusUnion }, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {
    if (input.salesStatus === 'Cancelled') throw new Error("The order was Cancelled");

    let paymentStatus: PaymentStatusUnion = 'Cancelled'

    if (input.paymentStatus === 'Paid') {
      paymentStatus = 'Refunded'
    }

    const orderResult = await db.update(shop_orders)
      .set({ active: false, paymentStatus: paymentStatus, salesStatus: 'Cancelled' })
      .where(eq(shop_orders.id, input.id))
      .returning({ id: shop_orders.id, salesAmount: shop_orders.salesAmount, customerId: shop_orders.customerId });

    await db.update(orders_details).set({ active: false }).where(eq(orders_details.shopOrdersId, input.id)).returning({ id: shop_orders.id });

    if (input.salesStatus === 'Quotation') return { message: "success", }

    if (input.paymentStatus === 'Paid') {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customerId))
      // Paid order totals was already removed
      const ordersTotals = contact[0].ordersTotals
      const totalReceipt = subtractMany([contact[0].totalReceipts, orderResult[0].salesAmount])
      await db.update(contacts).set({ ordersTotals: ordersTotals, totalReceipts: totalReceipt.toString() })
        .where(eq(contacts.id, orderResult[0].customerId))
    } else {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customerId))
      const ordersTotals = subtractMany([contact[0].ordersTotals, orderResult[0].salesAmount])
      await db.update(contacts).set({ ordersTotals: ordersTotals.toString() })
        .where(eq(contacts.id, orderResult[0].customerId))
    }

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:124 ~ deleteById ~ error:", error)
  }
};

export const changeSalesStatusById = async (input: { id: number, salesStatus: string }, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    const salesStatus = input.salesStatus as SalesStatusUnion

    let paymentStatus: PaymentStatusUnion = 'Awaiting Sales Order'

    if (!(input.salesStatus === 'Quotation')) {
      paymentStatus = 'Awaiting Payment'
    }

    const orderResult = await db.update(shop_orders)
      .set({ userId: ctx.session.user.userId, salesStatus: salesStatus, paymentStatus: paymentStatus })
      .where(eq(shop_orders.id, input.id))
      .returning({ id: shop_orders.id, salesAmount: shop_orders.salesAmount, customerId: shop_orders.customerId });

    if (!(input.salesStatus === 'Quotation')) {
      const contact = await db.select().from(contacts).where(eq(contacts.id, orderResult[0].customerId))
      const ordersTotals = addMany([orderResult[0].salesAmount, contact[0].ordersTotals])
      await db.update(contacts).set({ ordersTotals: ordersTotals.toString() }).where(eq(contacts.id, orderResult[0].customerId))
    }

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:162 ~ changeSalesStatusById ~ error:", error)
  }
};

export const getById = async (input: number, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    let pricelistMap: PricelistToMap
    let exchangeRateMap: ExchangeRateToMap

    const ordersQuery = (await db.select().from(shop_orders).where(and(eq(shop_orders.active, true), eq(shop_orders.id, input))))[0]
    if (!ordersQuery) throw new Error("Order not found");
    const customerQuery = await getContactById(ordersQuery.customerId, ctx)
    if (!customerQuery) throw new Error("Customer not found");
    const pricelistQuery = await getPricelistById(ordersQuery.pricelistId, ctx)
    if (!pricelistQuery) throw new Error("Pricelist not found");
    pricelistMap = pricelistToMapObj(pricelistQuery)
    const exchangeRateQuery = await getExchangeRateById(ordersQuery.exchangeRatesId, ctx)
    if (!exchangeRateQuery) throw new Error("Exchange rate not found");
    exchangeRateMap = exchangeRateToMapObj(exchangeRateQuery)
    const ordersDetailsQuery = await db.select().from(orders_details).where(eq(orders_details.shopOrdersId, input))
    const productsArray = ordersDetailsQuery.map((item) => item.productId)
    // const productsQuery = await db.select().from(products).where(inArray(products.id, productsArray))
    const productsQuery = await db.select().from(products).where(sql`${products.id} IN ${productsArray}`)

    if (productsQuery.length === 0) throw new Error("Products not found");

    return {
      pricelist: pricelistMap,
      exchangeRate: exchangeRateMap,
      customer: customerQuery.contact,
      products: productsQuery,
      orders_details: ordersDetailsQuery,
      order: ordersQuery,
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:165 ~ getById ~ error:", error)
  }
};