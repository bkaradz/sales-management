import { getPagination } from '$lib/utility/pagination.util';
import type { saveProduct } from '$lib/trpc/routes/products/product.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import omit from 'lodash-es/omit';
import type { Context } from '$lib/trpc/context';
import { error } from '@sveltejs/kit';

export const getProducts = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0];

	let query: any;
	let queryTotal: any;

	const baseQuery = {
		take: pagination.limit,
		skip: (pagination.page - 1) * pagination.limit,
		orderBy: {
			name: 'asc'
		}
	};

	if (objectKeys) {
		query = {
			...baseQuery,
			where: {
				isActive: true,
				[objectKeys]: {
					contains: finalQuery[objectKeys],
					mode: 'insensitive'
				}
			}
		};
		queryTotal = {
			where: {
				isActive: true,
				[objectKeys]: {
					contains: finalQuery[objectKeys],
					mode: 'insensitive'
				}
			}
		};
	} else {
		query = {
			where: {
				isActive: true
			},
			...baseQuery
		};
		queryTotal = {
			where: {
				isActive: true
			}
		};
	}

	const productsQuery = await db.query.products.findMany(query);

	pagination.totalRecords = await db.query.products.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: productsQuery, ...pagination };
};

export type GetProducts = typeof getProducts;

export const getById = async (input: number) => {
	const product = await db.query.products.findUnique({
		where: {
			id: input
		}
	});

	return product;
};

export type GetById = typeof getById;

export const deleteById = async (input: number) => {
	const product = await db.query.products.update({
		where: {
			id: input
		},
		data: { isActive: false }
	});
	return product;
};

export type DeleteById = typeof deleteById;

export const saveOrUpdateProducts = async (input: saveProduct, ctx: Context) => {
	if (!ctx?.userId) {
		throw error(404,'User not authorised');
	}

	const created_by = ctx.userId;

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

