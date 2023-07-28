import prisma from '$lib/server/prisma/client';
import { getPagination } from '$lib/utility/pagination.util';
import type { saveProduct } from '$lib/trpc/routes/products/product.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Prisma } from '@prisma/client';
import omit from 'lodash-es/omit';
import type { Context } from '$lib/trpc/context';
import { error } from '@sveltejs/kit';

export const getProductsPrisma = async (input: SearchParams) => {
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

	const productsQuery = await prisma.products.findMany(query);

	pagination.totalRecords = await prisma.products.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: productsQuery, ...pagination };
};

export type GetProducts = typeof getProductsPrisma;
export type GetProductsReturn = Prisma.PromiseReturnType<typeof getProductsPrisma>;

export const getByIdPrisma = async (input: number) => {
	const product = await prisma.products.findUnique({
		where: {
			id: input
		}
	});

	return product;
};

export type GetById = typeof getByIdPrisma;
export type GetByIdReturn = Prisma.PromiseReturnType<typeof getByIdPrisma>;

export const deleteByIdPrisma = async (input: number) => {
	const product = await prisma.products.update({
		where: {
			id: input
		},
		data: { isActive: false }
	});
	return product;
};

export type DeleteById = typeof deleteByIdPrisma;
export type DeleteByIdReturn = Prisma.PromiseReturnType<typeof deleteByIdPrisma>;

export const saveOrUpdateProductsPrisma = async (input: saveProduct, ctx: Context) => {
	if (!ctx?.userId) {
		throw error(404,'User not authorised');
	}

	const createdBy = ctx.userId;

	if (input.id) {
		return await prisma.products.update({
			where: {
				id: input.id
			},
			data: {
				...input,
				createdBy
			}
		});
	} else {
		return await prisma.products.create({
			data: {
				...input,
				createdBy
			}
		});
	}
};

export type SaveOrUpdateProducts = typeof saveOrUpdateProductsPrisma;
export type SaveOrUpdateProductsReturn = Prisma.PromiseReturnType<
	typeof saveOrUpdateProductsPrisma
>;
