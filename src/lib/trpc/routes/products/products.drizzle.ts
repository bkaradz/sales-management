import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from '$lib/trpc/context';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { products } from '$lib/server/drizzle/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import trim from 'lodash-es/trim';
import { dollars } from '$lib/utility/calculateCart.util';
import type { saveProduct } from '$lib/validation/product.zod';

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

			productsQuery = await db.select().from(products)
				.orderBy(asc(products.name))
				.where(eq(products.active, true))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

		} else {

			const data = `%${input.search}%`

			totalProductsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(products)
				.where(and((sql`to_tsvector('simple', ${products.name} ||' '|| CAST(id AS text) ||' '|| coalesce(CAST(stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(products.active, true))));
			// .where(and((sql`(name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE(${data})`), (eq(products.active, true))));

			productsQuery = await db.select().from(products)
				.orderBy(asc(products.name))
				.where(and((sql`to_tsvector('simple', name ||' '|| CAST(id AS text) ||' '|| coalesce(CAST(stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(products.active, true))))
				// .where(and((sql`(name ||' '|| CAST(id AS text) ||' '|| CAST(stitches AS text)) ILIKE(${data})`), (eq(products.active, true))))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

		}

		pagination.totalRecords = +totalProductsRecords[0].count
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

		await db.update(products).set({ active: false }).where(eq(products.id, input));

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

export const updateProduct = async (input: saveProduct & { id: number }, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		await db.update(products)
			.set({ user_id: ctx.session.user.userId, updated_at: new Date(), ...input })
			.where(eq(products.id, input.id))
			.returning({ id: products.id });

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:216 ~ updateProduct ~ error:", error)
	}

};

export const uploadProducts = async (input: any[], ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		input.forEach(async (product) => {

			try {

				/**
				 * TODO: Validation
				 */

				await db.insert(products).values({ user_id: ctx.session.user.userId, name: product.name, stitches: product.stitches, product_category: 'Embroidery' })

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