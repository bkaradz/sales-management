import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { shop_orders, orders_details, contacts, products } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';


export const getSalesReports = async (input: SearchParams, ctx: Context) => {

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    let ordersQuery

    if (!trim(input.search)) {

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_full_name: contacts.full_name,
        product_name: products.name,
        product_category: products.product_category,
        order_details_quantity: orders_details.quantity,
        order_details_unit_price: orders_details.unit_price,
        order_payment_status: shop_orders.payment_status
      }).from(shop_orders)
        .where(
          and(eq(shop_orders.active, true),
            and(ne(shop_orders.sales_status, 'Quotation'),
              ne(orders_details.production_status, 'Collected'))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
        .orderBy(desc(shop_orders.id))

    } else {

      const data = `%${input.search}%`

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_full_name: contacts.full_name,
        product_name: products.name,
        product_category: products.product_category,
        order_details_quantity: orders_details.quantity,
        order_details_unit_price: orders_details.unit_price,
        order_payment_status: shop_orders.payment_status
      }).from(shop_orders)
        .where(
          and((sql`(full_name ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(ne(shop_orders.sales_status, 'Quotation'),
                ne(orders_details.production_status, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.order_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
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

  if (!ctx.session.sessionId) {
    throw error(404, 'User not found');
  }

  try {

    let ordersQuery

    if (!trim(input.search)) {

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_full_name: contacts.full_name,
        product_name: products.name,
        product_category: products.product_category,
        product_stitches: products.stitches,
        order_details_quantity: orders_details.quantity,
        order_details_garment_placement: orders_details.garment_placement,
        order_details_unit_price: orders_details.unit_price,
        order_payment_status: shop_orders.payment_status
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

    } else {

      const data = `%${input.search}%`

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        contact_full_name: contacts.full_name,
        product_name: products.name,
        product_category: products.product_category,
        product_stitches: products.stitches,
        order_details_quantity: orders_details.quantity,
        order_details_garment_placement: orders_details.garment_placement,
        order_details_unit_price: orders_details.unit_price,
        order_payment_status: shop_orders.payment_status
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
    }

    return {
      shop_orders: ordersQuery,
    }

  } catch (error) {
    console.error("🚀 ~ file: reports.drizzle.ts:141 ~ getDailyProductionReport ~ error:", error)
  }
};

export type GetDailyProductionReport = Awaited<ReturnType<typeof getDailyProductionReport>>
