import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from '$lib/trpc/context';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { orders_details, products } from '$lib/server/drizzle/schema/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import trim from 'lodash-es/trim';
import type { saveProduct, saveProductArray } from '$lib/validation/product.zod';

export const getProducts = async (input: SearchParams, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	const pagination = getPagination(input);

	try {

		let totalProductsRecords
		let productsQuery

		if (!trim(input.search)) {

			totalProductsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(products)
				.where(eq(products.active, true))

			productsQuery = await db.select({
				id: products.id,
				name: products.name,
				product_category: products.product_category,
				stitches: products.stitches,
				stork_quantity: products.stork_quantity,
				product_unit_price: products.product_unit_price
			}).from(products)
				.orderBy(asc(products.name))
				.where(eq(products.active, true))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

		} else {

			// const data = `%${input.search}%`

			totalProductsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(products)
				.where(and((sql`to_tsvector('simple', ${products.name} ||' '|| CAST(id AS text) ||' '|| coalesce(CAST(stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(products.active, true))));
			// .where(and((sql`(name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE(${data})`), (eq(products.active, true))));

			productsQuery = await db.select({
				id: products.id,
				name: products.name,
				product_category: products.product_category,
				stitches: products.stitches,
				stork_quantity: products.stork_quantity,
				product_unit_price: products.product_unit_price
			}).from(products)
				.orderBy(asc(products.name))
				.where(and((sql`to_tsvector('simple', name ||' '|| CAST(id AS text) ||' '|| coalesce(CAST(stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(products.active, true))))
				// .where(and((sql`(name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE(${data})`), (eq(products.active, true))))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

		}

    pagination.totalRecords = totalProductsRecords.length === 0 ? 0 : +totalProductsRecords[0]?.count

		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = undefined;
		}

		return {
			products: productsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:84 ~ getProducts ~ error:", error)
	}
};

export type GetProducts = NonNullable<Awaited<ReturnType<typeof getProducts>>>

export const getById = async (input: number, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		const productsQuery = await db.select().from(products).where(eq(products.id, input))

		return {
			product: productsQuery[0],
		}

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:84 ~ getProducts ~ error:", error)
	}
};

export const deleteById = async (input: number, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		// check that the customer does not have shop_orders
		const totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders_details).where(eq(orders_details.product_id, input))

		if (+totalOrdersRecords[0].count !== 0) {
			await db.update(products).set({ active: false }).where(eq(products.id, input));
		} else {
			await db.delete(products).where(eq(products.id, input));
		}

		return {
			message: "success",
		}

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:84 ~ getProducts ~ error:", error)
	}
};

export const createProduct = async (input: saveProduct, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		await db.insert(products).values({ user_id: ctx.session.user.userId, ...input });

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:143 ~ createProduct ~ error:", error)
	}

};

export const updateProduct = async (input: any, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		await db.update(products)
			.set({ user_id: ctx.session.user.userId, ...input })
			.where(eq(products.id, input.id))
			.returning({ id: products.id });

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:216 ~ updateProduct ~ error:", error)
	}

};

export const uploadProducts = async (input: saveProductArray, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		input.forEach(async (product) => {

			try {

				const { name, ...rest } = product

				await db.insert(products).values({ user_id: ctx.session.user.userId, ...product })
					.onConflictDoUpdate({ target: products.id, set: { ...rest } });

			} catch (err: unknown) {

				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}

		});

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:84 ~ getProducts ~ error:", error)
	}
};