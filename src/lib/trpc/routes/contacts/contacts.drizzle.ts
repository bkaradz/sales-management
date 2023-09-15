import { getPagination } from '$lib/utility/pagination.util';
import { getBoolean } from '$lib/utility/toBoolean';
import type { SaveContact, SaveContactKeys } from '$lib/trpc/routes/contacts/contact.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import omit from 'lodash-es/omit';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { asc, eq, sql } from 'drizzle-orm';
import { address, contacts, emails, phones } from '$lib/server/drizzle/schema';

export const getContacts = async (input: SearchParams) => {
	const pagination = getPagination(input);

	// const finalQuery = omit(input, ['page', 'limit', 'sort']);

	// const objectKeys = Object.keys(finalQuery)[0] as SaveContactKeys;

	// let whereQuery;

	// if (objectKeys === 'isCorporate' || objectKeys === 'isActive') {
	// 	whereQuery = {
	// 		equals: getBoolean(finalQuery[objectKeys] as any)
	// 	};
	// } else {
	// 	whereQuery = {
	// 		contains: finalQuery[objectKeys],
	// 		mode: 'insensitive'
	// 	};
	// }

	// let query;
	// let queryTotal;

	// const baseQuery = {
	// 	take: pagination.limit,
	// 	skip: (pagination.page - 1) * pagination.limit,
	// 	with: {
	// 		email: true,
	// 		phone: true,
	// 		address: true
	// 	}
	// };

	// if (objectKeys) {
	// 	query = {
	// 		...baseQuery,
	// 		where: {
	// 			isActive: true,
	// 			[objectKeys]: whereQuery
	// 		}
	// 	};
	// 	queryTotal = {
	// 		where: {
	// 			isActive: true,
	// 			[objectKeys]: whereQuery
	// 		}
	// 	};
	// } else {
	// 	query = {
	// 		...baseQuery,
	// 		where: {
	// 			isActive: true
	// 		}
	// 	};
	// 	queryTotal = {
	// 		where: {
	// 			isActive: true
	// 		}
	// 	};
	// }

	try {
		const totalContactsRecords =  await db.select({ count: sql<number>`count(*)` }).from(contacts);
		console.log("🚀 ~ file: contacts.drizzle.ts:76 ~ getContacts ~ totalContactsRecords:", totalContactsRecords)

		pagination.totalRecords =  +totalContactsRecords[0].count
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		const contactsQuery = await db.select().from(contacts)
		.orderBy(asc(contacts.full_name))
		.leftJoin(phones, eq(contacts.id, phones.contact_id))
		.leftJoin(emails, eq(contacts.id, emails.contact_id))
		.leftJoin(address, eq(contacts.id, address.contact_id))
		.limit(10).offset(10)
		console.log("🚀 ~ file: contacts.drizzle.ts:80 ~ getContacts ~ contactsQuery:", contactsQuery)
		console.log("🚀 ~ file: contacts.drizzle.ts:14 ~ getContacts ~ pagination:", pagination)

		return {
			payload: contactsQuery,
			pagination
		}

	} catch (error) {

		console.log("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
		
	}

	
	// pagination.totalRecords = await db.contact.count(queryTotal);
	// pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	// if (pagination.endIndex >= pagination.totalRecords) {
	// 	pagination.next = undefined;
	// }

	// return { results: contactsQuery, ...pagination };
};

export type GetContacts = typeof getContacts;

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
		with: {
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

	const contactsQuery = await db.query.contacts.findMany({
		...query,
		with: {
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
	pagination.totalRecords = await db.query.contacts.count(queryTotal);
	pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

	if (pagination.endIndex >= pagination.totalRecords) {
		pagination.next = undefined;
	}

	return { results: contactsQuery, ...pagination };
};

export type GetCorporate = typeof getCorporate;


export const getById = async (input: number) => {
	const contacts = await db.query.contacts.findUnique({
		where: {
			id: input
		},
		with: {
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

export const deleteById = async (input: number) => {
	const product = await db.query.contact.update({
		where: {
			id: input
		},
		data: { isActive: false }
	});
	return product;
};

export type DeleteById = typeof deleteById;

export const saveOrUpdateContact = async (input: SaveContact, ctx: Context) => {
	if (!ctx.userId) {
		throw error(404,'User not found');
	}

	if (input.id) {
		return await db.query.contact.update({
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
		return await db.query.contacts.create({
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
