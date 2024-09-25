import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from '$lib/trpc/context';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { orders_details, products } from '$lib/server/drizzle/schema/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import trim from 'lodash-es/trim';
import type { saveProduct, saveProductArray } from '$lib/validation/product.zod';
import type { ProductCategoriesUnion } from '$lib/utility/lists.utility';

export const getProducts = async (input: SearchParams, ctx: Context) => {

	if (!ctx.session) {
		error(404, 'User not found');
	}

	const pagination = getPagination(input);
	const limitRows = pagination.limit;
	const offsetRows = (pagination.page - 1) * limitRows;

	try {

		let totalProductsRecords: { count: string }[]
		let productsQuery

		if (!trim(input.search)) {

			totalProductsRecords = await db.select({ count: sql<string>`count(*)` })
				.from(products)
				.where(eq(products.active, true)) as { count: string }[]

			productsQuery = await db.select({
				id: products.id,
				name: products.name,
				productCategory: products.productCategory,
				stitches: products.stitches,
				storkQuantity: products.storkQuantity,
				productUnitPrice: products.productUnitPrice
			}).from(products)
				.orderBy(asc(products.name))
				.where(eq(products.active, true))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

		} else {

			const data = `${input.search} AND active:true`

			// totalProductsRecords = await db.select({ count: sql<number>`count(*)` })
			// 	.from(products)
			// 	.where(and((sql`to_tsvector('simple', products.name ||' '|| CAST(products.id AS text) ||' '|| coalesce(CAST(products.stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(products.active, true))));

			// productsQuery = await db.select({
			// 	id: products.id,
			// 	name: products.name,
			// 	productCategory: products.productCategory,
			// 	stitches: products.stitches,
			// 	storkQuantity: products.storkQuantity,
			// 	productUnitPrice: products.productUnitPrice
			// }).from(products)
			// 	.orderBy(asc(products.name))
			// 	.where(and((sql`to_tsvector('simple', products.name ||' '|| CAST(products.id AS text) ||' '|| coalesce(CAST(products.stitches AS text), '') ) @@ plainto_tsquery('simple', ${input.search})`), (eq(products.active, true))))
			// 	.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

			totalProductsRecords = await db.execute(sql`SELECT count(*)	FROM products_idx.search(${data}, fuzzy_fields => 'name, id, stitches')`) as { count: string }[]

			productsQuery = await db.execute(sql`
				SELECT 
				products.id as id,
				products.name as name,
				products.productCategory as productCategory,
				products.stitches as stitches,
				products.storkQuantity as storkQuantity,
				products.productUnitPrice as productUnitPrice, 
				rank.rank_bm25 AS ranking
				FROM products_idx.search(${data}, fuzzy_fields => 'name, id, stitches', limit_rows => ${limitRows}, offset_rows => ${offsetRows}) as products
				LEFT JOIN products_idx.rank(${data}, fuzzy_fields => 'name, id, stitches', limit_rows => ${limitRows}, offset_rows => ${offsetRows}) as rank ON products.id = rank.id
				ORDER BY rank.rank_bm25 DESC;
			`) as unknown as { id: number, name: string, productCategory: ProductCategoriesUnion, stitches: number, storkQuantity: number | null, productUnitPrice: string, ranking: number }[]
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
		error(404, 'User not found');
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
		error(404, 'User not found');
	}

	try {

		// check that the customer does not have shop_orders
		const totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(orders_details).where(eq(orders_details.productId, input))

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

	if (!ctx?.session?.id) {
		error(404, 'User not found');
	}

	try {

		await db.insert(products).values({ userId: ctx.session.user.userId, ...input });

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:143 ~ createProduct ~ error:", error)
	}

};

export const updateProduct = async (input: any, ctx: Context) => {

	if (!ctx?.session?.id) {
		error(404, 'User not found');
	}

	try {

		await db.update(products)
			.set({ userId: ctx.session.user.userId, ...input })
			.where(eq(products.id, input.id))
			.returning({ id: products.id });

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: products.drizzle.ts:216 ~ updateProduct ~ error:", error)
	}

};

export const uploadProducts = async (input: saveProductArray, ctx: Context) => {

	if (!ctx.session) {
		error(404, 'User not found');
	}

	try {

		input.forEach(async (product) => {

			try {

				const { name, ...rest } = product

				await db.insert(products).values({ userId: ctx.session.user.userId, ...product })
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