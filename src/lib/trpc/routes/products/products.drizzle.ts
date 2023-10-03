import { getPagination } from '$lib/utility/pagination.util';
import type { saveProduct } from '$lib/trpc/routes/products/product.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import omit from 'lodash-es/omit';
import type { Context } from '$lib/trpc/context';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { products } from '$lib/server/drizzle/schema';
import { asc, eq, sql } from 'drizzle-orm';

export const getProducts = async (input: SearchParams) => {
	const pagination = getPagination(input);

	try {
		const totalContactsRecords = await db.select({ count: sql<number>`count(*)` }).from(products);

		pagination.totalRecords = +totalContactsRecords[0].count
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		const productsQuery = await db.select().from(products)
			.orderBy(asc(products.name))
			.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

		return {
			payload: productsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};

export const getById = async (input: number) => {
	try {

		const productsQuery = await db.select().from(products).where(eq(products.id, input)).orderBy(asc(contacts.full_name))

		return {
			payload: productsQuery,
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};


export const deleteById = async (input: number) => {
	try {

		await db.update(products)
  			.set({ active: false })
  			.where(eq(products.id, input));

		return {
			message: "success",
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};


export const saveOrUpdateProducts = async (input: saveProduct, ctx: Context) => {
	if (!ctx.session.sessionId) {
		throw error(404,'User not authorised');
	}

	const created_by = ctx.session.userId;

	if (input.id) {
		return await db.query.products.update({
			where: {
				id: input.id
			},
			data: {
				...input,
				created_by
			}
		});
	} else {
		return await db.query.products.create({
			data: {
				...input,
				created_by
			}
		});
	}
};

export type SaveOrUpdateProducts = typeof saveOrUpdateProducts;

