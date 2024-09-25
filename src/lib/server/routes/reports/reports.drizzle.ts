import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/server/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { shop_orders, orders_details, contacts, products } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';


export const getSalesReports = async (input: SearchParams, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    let ordersQuery

    if (!trim(input.search)) {

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_fullName: contacts.fullName,
        product_name: products.name,
        productCategory: products.productCategory,
        order_details_quantity: orders_details.quantity,
        order_details_unitPrice: orders_details.unitPrice,
        order_paymentStatus: shop_orders.paymentStatus
      }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(ne(shop_orders.salesStatus, 'Quotation'),
              ne(orders_details.productionStatus, 'Collected'))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.productId))
        .orderBy(desc(shop_orders.id))

    } else {

      const data = `%${input.search}%`

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_fullName: contacts.fullName,
        product_name: products.name,
        productCategory: products.productCategory,
        order_details_quantity: orders_details.quantity,
        order_details_unitPrice: orders_details.unitPrice,
        order_paymentStatus: shop_orders.paymentStatus
      }).from(shop_orders)
        .where(
          and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(ne(shop_orders.salesStatus, 'Quotation'),
                ne(orders_details.productionStatus, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.productId))
        .orderBy(desc(shop_orders.id))
    }

    return {
      shop_orders: ordersQuery,
    }

  } catch (error) {
    console.error("🚀 ~ file: reports.drizzle.ts:70 ~ getSalesReports ~ error:", error)
  }
};

export type GetSalesReports = Awaited<ReturnType<typeof getSalesReports>>

export const getDailyProductionReport = async (input: SearchParams, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    let ordersQuery

    if (!trim(input.search)) {

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_fullName: contacts.fullName,
        product_name: products.name,
        productCategory: products.productCategory,
        product_stitches: products.stitches,
        order_details_quantity: orders_details.quantity,
        order_details_garmentPlacement: orders_details.garmentPlacement,
        order_details_unitPrice: orders_details.unitPrice,
        order_paymentStatus: shop_orders.paymentStatus
      }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(eq(products.productCategory, 'Embroidery'),
              and(ne(shop_orders.salesStatus, 'Quotation'),
                ne(orders_details.productionStatus, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.productId))
        .orderBy(desc(shop_orders.id))

    } else {

      const data = `%${input.search}%`

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_fullName: contacts.fullName,
        product_name: products.name,
        productCategory: products.productCategory,
        product_stitches: products.stitches,
        order_details_quantity: orders_details.quantity,
        order_details_garmentPlacement: orders_details.garmentPlacement,
        order_details_unitPrice: orders_details.unitPrice,
        order_paymentStatus: shop_orders.paymentStatus
      }).from(shop_orders)
        .where(
          and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(products.productCategory, 'Embroidery'),
                and(ne(shop_orders.salesStatus, 'Quotation'),
                  ne(orders_details.productionStatus, 'Collected'))))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.productId))
        .orderBy(desc(shop_orders.id))
    }

    return {
      shop_orders: ordersQuery,
    }

  } catch (error) {
    console.error("🚀 ~ file: reports.drizzle.ts:141 ~ getDailyProductionReport ~ error:", error)
  }
};

export type GetDailyProductionReport = Awaited<ReturnType<typeof getDailyProductionReport>>
