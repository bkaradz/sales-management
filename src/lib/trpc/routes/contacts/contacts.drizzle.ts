import { getPagination } from '$lib/utility/pagination.util';
import { getBoolean } from '$lib/utility/toBoolean';
import type { SaveContact, SaveContactKeys } from '$lib/trpc/routes/contacts/contact.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import omit from 'lodash-es/omit';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';

export const getContacts = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0] as SaveContactKeys;

	let whereQuery;

	if (objectKeys === 'isCorporate' || objectKeys === 'isActive') {
		whereQuery = {
			equals: getBoolean(finalQuery[objectKeys] as any)
		};
	} else {
		whereQuery = {
			contains: finalQuery[objectKeys],
			mode: 'insensitive'
		};
	}

	let query;
	let queryTotal;

	const baseQuery = {
		take: pagination.limit,
		skip: (pagination.page - 1) * pagination.limit,
		include: {
			email: true,
			phone: true,
			address: true
		}
	};

	if (objectKeys) {
		query = {
			...baseQuery,
			where: {
				isActive: true,
				[objectKeys]: whereQuery
			}
		};
		queryTotal = {
			where: {
				isActive: true,
				[objectKeys]: whereQuery
			}
		};
	} else {
		query = {
			...baseQuery,
			where: {
				isActive: true
			}
		};
		queryTotal = {
			where: {
				isActive: true
			}
		};
	}

	const contactsQuery = await prisma.contacts.findMany({
		...query,
		include: {
			email: true,
			phone: true,
			address: true
		},
		orderBy: [
			{
				full_name: 'asc'
			}
		]
	});
	pagination.totalRecords = await prisma.contacts.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: contactsQuery, ...pagination };
};

export type GetContacts = typeof getContacts;
export type GetContactsReturn = Prisma.PromiseReturnType<typeof getContacts>;

export const getCorporate = async (input: SearchParams) => {
	const pagination = getPagination(input);

	const finalQuery = omit(input, ['page', 'limit', 'sort']);

	const objectKeys = Object.keys(finalQuery)[0] as SaveContactKeys;

	let whereQuery;

	if (objectKeys === 'isCorporate' || objectKeys === 'isActive') {
		whereQuery = {
			equals: getBoolean(finalQuery[objectKeys] as any)
		};
	} else {
		whereQuery = {
			contains: finalQuery[objectKeys],
			mode: 'insensitive'
		};
	}

	let query;
	let queryTotal;

	const baseQuery = {
		take: pagination.limit,
		skip: (pagination.page - 1) * pagination.limit,
		include: {
			email: true,
			phone: true,
			address: true
		}
	};

	if (objectKeys) {
		query = {
			...baseQuery,
			where: {
				isActive: true,
				[objectKeys]: whereQuery
			}
		};
		queryTotal = {
			where: {
				isActive: true,
				[objectKeys]: whereQuery
			}
		};
	} else {
		query = {
			...baseQuery,
			where: {
				isActive: true
			}
		};
		queryTotal = {
			where: {
				isActive: true
			}
		};
	}

	const contactsQuery = await prisma.contacts.findMany({
		...query,
		include: {
			email: true,
			phone: true,
			address: true
		},
		orderBy: [
			{
				full_name: 'asc'
			}
		]
	});
	pagination.totalRecords = await prisma.contacts.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: contactsQuery, ...pagination };
};

export type GetCorporate = typeof getCorporate;
export type GetCorporateReturn = Prisma.PromiseReturnType<typeof getCorporate>;

export const getById = async (input: number) => {
	const contacts = await prisma.contacts.findUnique({
		where: {
			id: input
		},
		include: {
			email: true,
			phone: true,
			address: true
		}
	});

	if (!contacts) {
		throw error(404,'Contact not found');
	}

	return contacts;
};

export type GetById = typeof getById;
export type GetByIdReturn = Prisma.PromiseReturnType<typeof getById>;

export const deleteById = async (input: number) => {
	const product = await prisma.contacts.update({
		where: {
			id: input
		},
		data: { isActive: false }
	});
	return product;
};

export type DeleteById = typeof deleteById;
export type DeleteByIdReturn = Prisma.PromiseReturnType<typeof deleteById>;

export const saveOrUpdateContact = async (input: SaveContact, ctx: Context) => {
	if (!ctx.userId) {
		throw error(404,'User not found');
	}

	if (input.id) {
		return await prisma.contacts.update({
			where: {
				id: input.id
			},
			data: {
				...input,
				email: {
					create: input.email
				},
				phone: {
					create: input.phone
				},
				address: {
					create: input.address
				}
			}
		});
	} else {
		return await prisma.contacts.create({
			data: {
				...input,
				email: {
					create: input.email
				},
				phone: {
					create: input.phone
				},
				address: {
					create: input.address
				}
			}
		});
	}
};

export type SaveOrUpdateContact = typeof saveOrUpdateContact;
export type SaveOrUpdateContactReturn = Prisma.PromiseReturnType<typeof saveOrUpdateContact>;