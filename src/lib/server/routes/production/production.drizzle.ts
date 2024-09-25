import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/server/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { shop_orders, orders_details, contacts, products } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';
import type { PaymentStatusUnion, ProductionStatusUnion } from '$lib/utility/lists.utility';


export const getProductionOrders = async (input: SearchParams, ctx: Context) => {

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
            and(eq(products.productCategory, 'Embroidery'),
              and(ne(shop_orders.salesStatus, 'Quotation'),
                ne(orders_details.productionStatus, 'Collected')))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.productId))

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        order_id: shop_orders.id,
        fullName: contacts.fullName,
        contacts_id: contacts.id,
        products_name: products.name,
        products_id: products.id,
        order_stitches: orders_details.stitches,
        order_quantity: orders_details.quantity,
        order_garmentPlacement: orders_details.garmentPlacement,
        order_productionStatus: orders_details.productionStatus,
        order_salesStatus: shop_orders.salesStatus,
        order_paymentStatus: shop_orders.paymentStatus,
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
        .limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

    } else {

      const data = `%${input.search}%`

      totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders)
        .where(
          and((sql`(contacts.fullName ||' '|| CAST(shop_orders.id AS text)) ILIKE(${data})`),
            and(eq(shop_orders.active, true),
              and(eq(products.productCategory, 'Embroidery'),
                and(ne(shop_orders.salesStatus, 'Quotation'),
                  ne(orders_details.productionStatus, 'Collected'))))))
        .innerJoin(contacts, eq(contacts.id, shop_orders.customerId))
        .innerJoin(orders_details, eq(orders_details.shopOrdersId, shop_orders.id))
        .innerJoin(products, eq(products.id, orders_details.productId))

      ordersQuery = await db.select({
        orders_details_id: orders_details.id,
        order_id: shop_orders.id,
        fullName: contacts.fullName,
        contacts_id: contacts.id,
        products_name: products.name,
        products_id: products.id,
        order_stitches: orders_details.stitches,
        order_quantity: orders_details.quantity,
        order_garmentPlacement: orders_details.garmentPlacement,
        order_productionStatus: orders_details.productionStatus,
        order_salesStatus: shop_orders.salesStatus,
        order_paymentStatus: shop_orders.paymentStatus,
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


export const changeProductionStatusById = async (input: { id: number, salesStatus: string, paymentStatus: PaymentStatusUnion, productionStatus: ProductionStatusUnion }, ctx: Context) => {

  if (!ctx?.session?.id) {
    error(404, 'User not found');
  }

  try {

    await db.update(orders_details).set({ productionStatus: input.productionStatus }).where(eq(orders_details.id, input.id))

    return {
      message: "success",
    }

  } catch (error) {
    console.error("🚀 ~ file: shop_orders.drizzle.ts:162 ~ changeSalesStatusById ~ error:", error)
  }
};
