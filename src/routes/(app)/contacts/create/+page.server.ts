import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import parseCsv from '$lib/utility/parseCsv';
import normalizePhone from '$lib/utility/normalizePhone.util';
import { db } from '$lib/server/drizzle/client';
import { address, contacts, emails, phones, users } from '$lib/server/drizzle/schema';


export const load = (async (event) => {
	const queryParams = {
		limit: 3,
		page: 1
	};

	const newCorporateContacts = async () => {
		return await router.createCaller(await createContext(event)).contacts.getCorporate(queryParams);
	};

	return {
		contacts: newCorporateContacts()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	upload: async ({ request, locals }) => {

		const session = await locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
		}

		const data = await request.formData()
		const file = data.get('contacts') as File

		if (!(file instanceof File)) {
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

		const csvString = (await file.text()) as string;

		const contactsArray = (await parseCsv(csvString)) as any[]

		const allDocsPromises: any[] = [];

		contactsArray.forEach(async (contact) => {

			try {
				const contactsTx = await db.transaction(async (tx) => {

					const contactResult = await tx.insert(contacts).values({ user_id: session.user.userId, full_name: contact.full_name, active: true, is_corporate: contact?.is_corporate || false, }).returning({ id: contacts.id });

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
	}
};