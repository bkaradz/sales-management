import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { address, contacts, emails, phones, type Contacts, type Phones, type Emails, type Address } from '$lib/server/drizzle/schema';
import trim from 'lodash-es/trim';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import type { SaveContacts } from '$lib/validation/contacts.zod';

export const getContacts = async (input: SearchParams, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

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

			const data = `%${input.search}%`

			totalContactsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(contacts)
				.where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), (eq(contacts.active, true))));

			contactsQuery = await db.select().from(contacts)
				.orderBy(asc(contacts.full_name))
				.where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), (eq(contacts.active, true))))
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

export const getById = async (input: number, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}


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

export const deleteById = async (input: number, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

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

export const createContact = async (input: SaveContacts, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		const contactResult = await db.insert(contacts).values({ user_id: ctx.session.user.userId, vat_or_bp_number: input.vat_or_bp_number, full_name: input.full_name, active: true, is_corporate: (input?.is_corporate == 'on' ? true : false), }).returning({ id: contacts.id });

		if (input?.phone) {
			input.phone.forEach(async (item: string) => {
				await db.insert(phones).values({ contact_id: contactResult[0].id, phone: item.trim() }).onConflictDoNothing()
			})

		}

		if (input?.email) {
			input.email.forEach(async (item: string) => {
				await db.insert(emails).values({ contact_id: contactResult[0].id, email: item.trim() }).onConflictDoNothing()
			})
		}

		if (input?.address) {
			input.address.forEach(async (item: string) => {
				await db.insert(address).values({ contact_id: contactResult[0].id, address: item.trim() }).onConflictDoNothing()
			})
		}

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:143 ~ createContact ~ error:", error)
	}

};

export const updateContact = async (input: SaveContacts & { id: number }, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		const deleteWait = []

		// delete address, phone and email with contact id from database then add new details
		deleteWait.push(await db.delete(phones).where(eq(phones.contact_id, input.id)).returning({ id: phones.id }))
		deleteWait.push(await db.delete(emails).where(eq(emails.contact_id, input.id)).returning({ id: emails.id }))
		deleteWait.push(await db.delete(address).where(eq(address.contact_id, input.id)).returning({ id: address.id }))

		const allDeleted = await Promise.all(deleteWait)

		const contactResult = await db.update(contacts)
			.set({ user_id: ctx.session.user.userId, updated_at: new Date(), vat_or_bp_number: input.vat_or_bp_number, full_name: input.full_name, active: true, is_corporate: (input?.is_corporate == 'on' ? true : false), })
			.where(eq(contacts.id, input.id))
			.returning({ id: contacts.id });

		if (input?.phone) {
			input.phone.forEach(async (item: string) => {
				await db.insert(phones).values({ contact_id: contactResult[0].id, phone: item.trim() }).onConflictDoNothing()
			})

		}

		if (input?.email) {
			input.email.forEach(async (item: string) => {
				await db.insert(emails).values({ contact_id: contactResult[0].id, email: item.trim() }).onConflictDoNothing()
			})
		}

		if (input?.address) {
			input.address.forEach(async (item: string) => {
				await db.insert(address).values({ contact_id: contactResult[0].id, address: item.trim() }).onConflictDoNothing()
			})
		}

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:216 ~ updateContact ~ error:", error)
	}

};

export const uploadContacts = async (input: any[], ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		/**
		 * TODO: Validation
		 */

		input.forEach(async (contact) => {

			try {

				const contactResult = await db.insert(contacts).values({ user_id: ctx.session.user.userId, full_name: contact.full_name, active: true, is_corporate: contact?.is_corporate || false, }).returning({ id: contacts.id });

				if (contact?.phone) {
					normalizePhone(contact.phone).forEach(async (item: string) => {
						await db.insert(phones).values({ contact_id: contactResult[0].id, phone: item.trim() }).onConflictDoNothing()
					})

				}

				if (contact?.email) {
					normalizeEmail(contact.email).forEach(async (item: string) => {
						await db.insert(emails).values({ contact_id: contactResult[0].id, email: item.trim() }).onConflictDoNothing()
					})
				}

				if (contact?.address) {
					normalizeAddress(contact.address).forEach(async (item: string) => {
						await db.insert(address).values({ contact_id: contactResult[0].id, address: item.trim() }).onConflictDoNothing()
					})
				}

			} catch (err: unknown) {

				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}

		});

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:84 ~ getContacts ~ error:", error)
	}
};