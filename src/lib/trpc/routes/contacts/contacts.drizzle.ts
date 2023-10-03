import { getPagination } from '$lib/utility/pagination.util';
import type { SaveContact, SaveContactKeys } from '$lib/trpc/routes/contacts/contact.validate';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { address, contacts, emails, phones, type Contacts, type Phones, type Emails, type Address } from '$lib/server/drizzle/schema';
import trim from 'lodash-es/trim';

export const getContacts = async (input: SearchParams) => {

	const pagination = getPagination(input);

	try {

		let totalContactsRecords
		let contactsQuery

		if (!trim(input.search)) {

			totalContactsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(contacts)
				.where(eq(contacts.active, true))

			contactsQuery = await db.select().from(contacts)
				.orderBy(asc(contacts.full_name))
				.where(eq(contacts.active, true))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)

		} else {
			
			totalContactsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(contacts)
				.where(and((sql`to_tsvector('simple', ${contacts.full_name}) @@ to_tsquery('simple', ${input.search})`), (eq(contacts.active, true))));

			contactsQuery = await db.select().from(contacts)
				.orderBy(asc(contacts.full_name))
				.where(and((sql`to_tsvector('simple', ${contacts.full_name}) @@ to_tsquery('simple', ${input.search})`), (eq(contacts.active, true))))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

		}

		pagination.totalRecords = +totalContactsRecords[0].count
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = undefined;
		}



		// if (!trim(input.search)) {
		// 	contactsQuery = await db.select().from(contacts)
		// 		.orderBy(asc(contacts.full_name))
		// 		.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
		// } else {
		// 	contactsQuery = await db.select().from(contacts)
		// 		.orderBy(asc(contacts.full_name))
		// 		.where(sql`to_tsvector('simple', ${contacts.full_name}) @@ to_tsquery('simple', ${input.search})`)
		// 		.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)
		// }

		return {
			contacts: contactsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};

export const getCorporate = async (input: SearchParams) => {

	try {

		const contactsQuery = await db.select().from(contacts).where(eq(contacts.is_corporate, true)).orderBy(asc(contacts.full_name))

		return {
			payload: contactsQuery,
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};

export type GetCorporate = typeof getCorporate;


export const getById = async (input: number) => {

	try {

		let contactsQuery: any[] = []

		contactsQuery = [...contactsQuery, ...(
			(await db.select({
				contact: contacts, phones
			}).from(contacts)
				.leftJoin(phones, eq(contacts.id, phones.contact_id))
				.where(eq(contacts.id, input)))
		)]
		contactsQuery = [...contactsQuery, ...(
			(await db.select({
				contact: contacts, address
			}).from(contacts)
				.leftJoin(address, eq(contacts.id, address.contact_id))
				.where(eq(contacts.id, input)))
		)]
		contactsQuery = [...contactsQuery, ...(
			(await db.select({
				contact: contacts, emails
			}).from(contacts)
				.leftJoin(emails, eq(contacts.id, emails.contact_id))
				.where(eq(contacts.id, input)))
		)]

		const result = contactsQuery.reduce<Record<number, { contact: Contacts; phones: Phones[]; emails: Emails[]; address: Address[] }>>(
			(acc, row) => {
				const contact = row.contact;
				const phones = row.phones;
				const emails = row.emails;
				const address = row.address;

				if (!acc[contact.id]) acc[contact.id] = { contact, phones: [], emails: [], address: [] };

				if (phones) acc[contact.id].phones.push(phones);

				if (emails) acc[contact.id].emails.push(emails);

				if (address) acc[contact.id].address.push(address);

				return acc;
			}, {},
		);

		return result[input]

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};


export const deleteById = async (input: number) => {

	try {

		await db.update(contacts)
			.set({ active: false })
			.where(eq(contacts.id, input));

		return {
			message: "success",
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};


export const saveOrUpdateContact = async (input: SaveContact, ctx: Context) => {
	if (!ctx.userId) {
		throw error(404, 'User not found');
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

// const contactsQuery = await db.select({
// 	contact: contacts,
// 	phones,
// 	emails,
// 	address
// }).from(contacts)
// 	.orderBy(asc(contacts.full_name))
// 	.leftJoin(phones, eq(contacts.id, phones.contact_id))
// 	.leftJoin(emails, eq(contacts.id, emails.contact_id))
// 	.leftJoin(address, eq(contacts.id, address.contact_id))
// 	.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit)