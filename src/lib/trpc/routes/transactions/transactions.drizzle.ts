import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from '$lib/trpc/context';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { contacts, orders, orders_details, products, transactions, transactions_details, type Products } from '$lib/server/drizzle/schema';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import trim from 'lodash-es/trim';
import type { transactionInput } from '../../../../routes/(app)/sales/payment/[id]/proxy+page.server';
import {getById as getOrdersById} from '../orders/orders.drizzle';
import { addMany, subtractMany } from '$lib/utility/calculateCart.util';
import { dinero, toSnapshot } from 'dinero.js';

export const getTransactions = async (input: SearchParams, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	const pagination = getPagination(input);

	try {

		let totalTransactionsRecords
		let transactionsQuery

		if (!trim(input.search)) {

			totalTransactionsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(transactions)
				.where(eq(transactions.active, true))

			transactionsQuery = await db.select().from(transactions)
				.orderBy(asc(transactions.id))
				.where(eq(transactions.active, true))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

		} else {

			const data = `%${input.search}%`

			totalTransactionsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(transactions)
				.where(and((sql`to_tsvector('simple', ${transactions.id} ||' '|| CAST(id AS text) ||' '|| coalesce(CAST(stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(transactions.active, true))));
			// .where(and((sql`(name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE(${data})`), (eq(transactions.active, true))));

			transactionsQuery = await db.select().from(transactions)
				.orderBy(asc(transactions.id))
				.where(and((sql`to_tsvector('simple', name ||' '|| CAST(id AS text) ||' '|| coalesce(CAST(stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(transactions.active, true))))
				// .where(and((sql`(name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE(${data})`), (eq(transactions.active, true))))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

		}

		pagination.totalRecords = +totalTransactionsRecords[0].count
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = undefined;
		}

		return {
			transactions: transactionsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: transactions.drizzle.ts:84 ~ getTransactions ~ error:", error)
	}
};

export const getById = async (input: number, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		const transactionsQuery = await db.select().from(transactions).where(eq(transactions.id, input))

		return {
			transaction: transactionsQuery[0],
		}

	} catch (error) {
		console.error("🚀 ~ file: transactions.drizzle.ts:84 ~ getTransactions ~ error:", error)
	}
};

export const deleteById = async (input: number, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		await db.update(transactions).set({ active: false }).where(eq(transactions.id, input));

		return {
			message: "success",
		}

	} catch (error) {
		console.error("🚀 ~ file: transactions.drizzle.ts:84 ~ getTransactions ~ error:", error)
	}
};

export const createTransaction = async (input: transactionInput, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		const customer = await db.select().from(contacts).where(eq(contacts.id, input.customer_id));

		const transactionOrders = await db.select().from(orders).where(inArray(orders.id, input.selected_orders_ids));

		const transactionOrdersDetails = await db.select().from(orders_details).where(inArray(orders_details.order_id, input.selected_orders_ids));

		const productsIdArray = transactionOrdersDetails.map((item) => item.product_id)

		const transactionOrdersProducts = await db.select().from(products).where(and(ne(products.product_category, 'Embroidery'), inArray(products.id, productsIdArray)));

    const nonEmbroideryProductsIdArray = new Map<number, Products>()
    
    transactionOrdersProducts.forEach((item) => nonEmbroideryProductsIdArray.set(item.id, item))

    // Insert transaction 
		const transactionId = await db.insert(transactions).values({ user_id: ctx.session.user.userId, ...input }).returning({id: transactions.id});

    // Update Orders payment_status as paid and sales_status to Invoiced
    const updateOrders = await db.update(orders).set({ payment_status: 'Paid', sales_status: 'Invoice' }).where(inArray(orders.id, input.selected_orders_ids))

    // Insert transaction details
    input.selected_orders_ids.forEach(async (item) => {
      await db.insert(transactions_details).values({ user_id: ctx.session.user.userId, orders_id: item, transaction_id: transactionId[0].id });
    })

    // Update products inventory
    transactionOrdersDetails.forEach(async(orderDetail) => {
      if (nonEmbroideryProductsIdArray.has(orderDetail.product_id)) {
        const quantity = nonEmbroideryProductsIdArray.get(orderDetail.product_id)?.quantity
        if (quantity) {
          await db.update(products).set({quantity: quantity - orderDetail.quantity})
          
        }
      }
    })

    // Update customer orders_totals and total_receipts
		const amountTendered = input.amount_tendered

		const customerDeposit = customer.deposit
		
    const salesAmountArray = transactionOrders.map((item) => dinero(item.sales_amount)) // correct
		const salesAmountTotal = addMany(salesAmountArray) // correct

    const total_receipts = toSnapshot(addMany([dinero(customer[0].total_receipts), salesAmountTotal])) // correct

		const totalAmountTendered = addMany([dinero(amountTendered), dinero(customerDeposit)])

    const deposit = toSnapshot(subtractMany([totalAmountTendered, salesAmountTotal]))

    const orders_totals = toSnapshot(subtractMany([dinero(customer.orders_totals), salesAmountTotal]))
    
    await db.update(contacts).set({deposit, orders_totals , total_receipts }).where(eq(contacts.id, input.customer_id))

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: transactions.drizzle.ts:143 ~ createTransaction ~ error:", error)
	}

};