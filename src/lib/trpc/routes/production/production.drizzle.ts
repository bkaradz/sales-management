import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { shop_orders, orders_details, contacts, products } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';
import type { PaymentStatusUnion, ProductionStatusUnion } from '$lib/utility/lists.utility';


export const getProductionOrders = async (input: SearchParams, ctx: Context) => {

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
            and(eq(products.product_category, 'Embroidery'),
              and(ne(shop_orders.sales_status, 'Quotation'),
                ne(orders_details.production_status, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customer_id))
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))
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
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))
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
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))
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
        .innerJoin(orders_details, eq(orders_details.shop_orders_id, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.product_id))
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
    console.error("🚀 ~ file: production.drizzle.ts:124 ~ getProductionOrders ~ error:", error)
  }
};

export type GetProductionOrders = Awaited<ReturnType<typeof getProductionOrders>>


export const changeProductionStatusById = async (input: { id: number, sales_status: string, payment_status: PaymentStatusUnion, production_status: ProductionStatusUnion }, ctx: Context) => {

  if (!ctx.session.sessionId) {
    error(404, 'User not found');
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
