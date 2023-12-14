import { getPagination } from '$lib/utility/pagination.util';
import type { SearchParams } from '$lib/validation/searchParams.validate';
import type { Context } from "$lib/trpc/context"
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/drizzle/client';
import { and, asc, eq, sql } from 'drizzle-orm';
import { address, contacts, emails, phones, type Contacts, type Phones, type Emails, type Address, shop_orders, orders_details } from '$lib/server/drizzle/schema/schema';
import trim from 'lodash-es/trim';
import type { SaveContacts, saveContactsArray } from '$lib/validation/contacts.zod';

export const getContactsList = async (input: SearchParams, ctx: Context) => {

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
				.groupBy(contacts.id)
				.where(eq(contacts.active, true))
				.leftJoin(shop_orders, and(eq(shop_orders.customer_id, contacts.id), eq(shop_orders.active, true)))
				.leftJoin(orders_details, and(eq(orders_details.shop_orders_id, shop_orders.id), eq(orders_details.active, true)))

			contactsQuery = await db.select({
				id: contacts.id,
				full_name: contacts.full_name,
				amount: contacts.amount,
				sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
				total_products: sql<string>`COALESCE(sum(${orders_details.quantity}), '0')`,
				total_orders: sql<string>`count(DISTINCT ${shop_orders.id})`
			}).from(contacts)
				.orderBy(asc(contacts.full_name))
				.groupBy(contacts.id)
				.where(eq(contacts.active, true))
				.leftJoin(shop_orders, and(eq(shop_orders.customer_id, contacts.id), eq(shop_orders.active, true)))
				.leftJoin(orders_details, and(eq(orders_details.shop_orders_id, shop_orders.id), eq(orders_details.active, true)))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

		} else {

			const data = `%${input.search}%`

			totalContactsRecords = await db.select({ count: sql<number>`count(*)` })
				.from(contacts)
				.groupBy(contacts.id)
				.where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), (eq(contacts.active, true))))
				.leftJoin(shop_orders, and(eq(shop_orders.customer_id, contacts.id), eq(shop_orders.active, true)))
				.leftJoin(orders_details, and(eq(orders_details.shop_orders_id, shop_orders.id), eq(orders_details.active, true)));

			contactsQuery = await db.select({
				id: contacts.id,
				full_name: contacts.full_name,
				amount: contacts.amount,
				sales_amount: sql<string>`COALESCE(sum(${orders_details.quantity} * ${orders_details.unit_price}), '0')`,
				total_products: sql<string>`COALESCE(sum(${orders_details.quantity}), '0')`,
				total_orders: sql<string>`count(DISTINCT ${shop_orders.id})`
			}).from(contacts)
				.orderBy(asc(contacts.full_name))
				.groupBy(contacts.id)
				.where(and((sql`(full_name ||' '|| CAST(id AS text)) ILIKE(${data})`), (eq(contacts.active, true))))
				.leftJoin(shop_orders, and(eq(shop_orders.customer_id, contacts.id), eq(shop_orders.active, true)))
				.leftJoin(orders_details, and(eq(orders_details.shop_orders_id, shop_orders.id), eq(orders_details.active, true)))
				.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

		}

		pagination.totalRecords = totalContactsRecords.length === 0 ? 0 : +totalContactsRecords[0]?.count
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = undefined;
		}

		return {
			contacts: contactsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:87 ~ getContactsList ~ error:", error)
	}
};

export type GetContactsList = NonNullable<Awaited<ReturnType<typeof getContactsList>>>

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

		pagination.totalRecords = totalContactsRecords.length === 0 ? 0 : +totalContactsRecords[0]?.count
		pagination.totalPages = Math.ceil(pagination.totalRecords / pagination.limit);

		if (pagination.endIndex >= pagination.totalRecords) {
			pagination.next = undefined;
		}

		return {
			contacts: contactsQuery,
			pagination
		}

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:143 ~ getContacts ~ error:", error)
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
				contact: contacts, address2: address
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
		console.error("🚀 ~ file: contacts.drizzle.ts:202 ~ getById ~ error:", error)
	}
};

export const deleteById = async (input: number, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		// check that the customer does not have shop_orders
		const totalOrdersRecords = await db.select({ count: sql<number>`count(*)` }).from(shop_orders).where(eq(shop_orders.customer_id, input))

		if (+totalOrdersRecords[0].count !== 0) {
			await db.update(contacts).set({ active: false }).where(eq(contacts.id, input));
		} else {
			await db.transaction(async (tx) => {
				await tx.delete(emails).where(eq(emails.contact_id, input));
				await tx.delete(phones).where(eq(phones.contact_id, input));
				await tx.delete(address).where(eq(address.contact_id, input));
				await tx.delete(contacts).where(eq(contacts.id, input));
			});
		}

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:231 ~ deleteById ~ error:", error)
	}
};

export const createContact = async (input: SaveContacts, ctx: Context) => {

	if (!ctx.session.sessionId) {
		throw error(404, 'User not found');
	}

	try {

		await db.transaction(async (tx) => {
			let contactResult: { id: number }[]
			const { email, phone, addresses, ...rest } = input

			contactResult = await tx.insert(contacts).values({ user_id: ctx.session.user.userId, ...rest }).returning({ id: contacts.id });

			await tx.transaction(async (tx2) => {
				if (phone) {
					phone.forEach(async (item: string) => {
						await tx2.insert(phones).values({ contact_id: contactResult[0].id, phone: item.trim() }).onConflictDoNothing()
					})
				}
				if (email) {
					email.forEach(async (item: string) => {
						await tx2.insert(emails).values({ contact_id: contactResult[0].id, email: item.trim() }).onConflictDoNothing()
					})
				}
				if (input?.addresses) {
					input.addresses.forEach(async (item: string) => {
						await tx2.insert(address).values({ contact_id: contactResult[0].id, address: item.trim() }).onConflictDoNothing()
					})
				}
			});
		});

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

		await db.transaction(async (tx) => {
			const deleteWait = []

			// delete address, phone and email with contact id from database then add new details
			deleteWait.push(await tx.delete(phones).where(eq(phones.contact_id, input.id)).returning({ id: phones.id }))
			deleteWait.push(await tx.delete(emails).where(eq(emails.contact_id, input.id)).returning({ id: emails.id }))
			deleteWait.push(await tx.delete(address).where(eq(address.contact_id, input.id)).returning({ id: address.id }))

			await Promise.all(deleteWait)

			let contactResult: { id: number }[]
			const { email, phone, addresses, ...rest } = input

			contactResult = await tx.update(contacts)
				.set({ user_id: ctx.session.user.userId, active: true, ...rest })
				.where(eq(contacts.id, input.id))
				.returning({ id: contacts.id });

			await tx.transaction(async (tx2) => {
				if (phone) {
					phone.forEach(async (item: string) => {
						await tx2.insert(phones).values({ contact_id: contactResult[0].id, phone: item.trim() }).onConflictDoNothing()
					})
				}
				if (email) {
					email.forEach(async (item: string) => {
						await tx2.insert(emails).values({ contact_id: contactResult[0].id, email: item.trim() }).onConflictDoNothing()
					})
				}
				if (input?.addresses) {
					input.addresses.forEach(async (item: string) => {
						await tx2.insert(address).values({ contact_id: contactResult[0].id, address: item.trim() }).onConflictDoNothing()
					})
				}
			});
		});

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:216 ~ updateContact ~ error:", error)
	}
};

export const uploadContacts = async (input: saveContactsArray, ctx: Context) => {

	if (!ctx.session) {
		throw error(404, 'User not found');
	}

	try {

		input.forEach(async (contact) => {

			try {

				await db.transaction(async (tx) => {
					let contactResult: { id: number }[]
					const { email, phone, addresses, ...rest } = contact
		
					contactResult = await tx.insert(contacts).values({ user_id: ctx.session.user.userId, ...rest }).returning({ id: contacts.id });
		
					await tx.transaction(async (tx2) => {
						if (phone) {
							phone.forEach(async (item: string) => {
								await tx2.insert(phones).values({ contact_id: contactResult[0].id, phone: item.trim() }).onConflictDoNothing()
							})
						}
						if (email) {
							email.forEach(async (item: string) => {
								await tx2.insert(emails).values({ contact_id: contactResult[0].id, email: item.trim() }).onConflictDoNothing()
							})
						}
						if (contact?.addresses) {
							contact.addresses.forEach(async (item: string) => {
								await tx2.insert(address).values({ contact_id: contactResult[0].id, address: item.trim() }).onConflictDoNothing()
							})
						}
					});
				});

			} catch (err: unknown) {

				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}

		});

		return { success: true }

	} catch (error) {
		console.error("🚀 ~ file: contacts.drizzle.ts:392 ~ uploadContacts ~ error:", error)
	}
};

