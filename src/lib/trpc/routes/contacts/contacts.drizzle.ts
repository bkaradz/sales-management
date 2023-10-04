import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { address, contacts, emails, phones, type Contacts, type Phones, type Emails, type Address } from '$lib/server/drizzle/schema';
import trim from 'lodash-es/trim';
import normalizePhone from '$lib/utility/normalizePhone.util';

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

		return {
			contacts: contactsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};

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


export const createContact = async (input: any, ctx: Context) => {
	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		await db.transaction(async (tx) => {

			const contactResult = await tx.insert(contacts).values({ user_id: ctx.session.user.userId, full_name: input.full_name, active: true, is_corporate: input?.is_corporate || false, }).returning({ id: contacts.id });

			if (input?.phone) {
				normalizePhone(input.phone).forEach(async (item: { phone: any; }) => {

					await tx.transaction(async (tx2) => {
						await tx2.insert(phones).values({ contact_id: contactResult[0].id, phone: item.phone })
					})
				})

			}

			if (input?.email) {
				input.email.split(',').forEach(async (item: { email: any; }) => {
					await tx.transaction(async (tx2) => {
						await tx2.insert(emails).values({ contact_id: contactResult[0].id, email: item.email })
					})
				})
			}

			if (input?.address) {
				input.address.split(',').forEach(async (item: { address: any; }) => {
					await tx.transaction(async (tx2) => {
						await tx2.insert(address).values({ contact_id: contactResult[0].id, address: item.address })
					})
				})
			}
		});

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:143 ~ createContact ~ error:", error)
	}

};

export const uploadContacts = async (input: any[], ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		const allDocsPromises: any[] = [];

		input.forEach(async (contact) => {

			try {
				const contactsTx = await db.transaction(async (tx) => {

					const contactResult = await tx.insert(contacts).values({ user_id: ctx.session.user.userId, full_name: contact.full_name, active: true, is_corporate: contact?.is_corporate || false, }).returning({ id: contacts.id });

					if (contact?.phone) {
						normalizePhone(contact.phone).forEach(async (item: { phone: any; }) => {

							await tx.transaction(async (tx2) => {
								await tx2.insert(phones).values({ contact_id: contactResult[0].id, phone: item.phone })
							})
						})

					}

					if (contact?.email) {
						contact.email.split(',').forEach(async (item: { email: any; }) => {
							await tx.transaction(async (tx2) => {
								await tx2.insert(emails).values({ contact_id: contactResult[0].id, email: item.email })
							})
						})
					}

					if (contact?.address) {
						contact.address.split(',').forEach(async (item: { address: any; }) => {
							await tx.transaction(async (tx2) => {
								await tx2.insert(address).values({ contact_id: contactResult[0].id, address: item.address })
							})
						})
					}
				});

				allDocsPromises.push(contactsTx)

			} catch (err: unknown) {

				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}
		});

		await Promise.all(allDocsPromises);

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};
