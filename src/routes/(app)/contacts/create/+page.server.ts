import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import parseCsv from '$lib/utility/parseCsv';
import normalizePhone from '$lib/utility/normalizePhone.util';
import { db } from '$lib/server/drizzle/client';
import { contact } from '$lib/server/drizzle/schema/index';

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


		const contactsArray = (await parseCsv(csvString))

		const allDocsPromises = [];

		contactsArray.forEach(async (element) => {
			try {
				const contactData = querySelection(element, user);
				const contactsQuery = await db.insert(contact).values( contactData );
				allDocsPromises.push(contactsQuery);
			} catch (err: unknown) {
				return fail(500, {
					message: 'A server error occurred',
					errors: err
				})
			}
		});

		const allDocs = await Promise.all(allDocsPromises);

		return { success: true, payload: JSON.stringify(allDocs) }
	}
};

const querySelection = (reqContact: any, user: { userId: string, username: string, full_name: string }) => {
	let { full_name, email, phone, address } = reqContact;

	full_name = full_name.trim();
	if (email) {
		email = email.split(',').map((data: string) => {
			return { email: data.trim() };
		});
	}
	if (phone) {
		phone = normalizePhone(phone);
	}
	if (address) {
		address = address.split(',').map((data: string) => {
			return { address: data.trim() };
		});
	}

	let contact;

	contact = {
		created_by: user.userId,
		full_name,
		isActive: true,
	};

	if (email) {
		contact = {
			...contact,
			email: { createMany: { data: email } }
		};
	}
	if (phone) {
		contact = {
			...contact,
			phone: { createMany: { data: phone } }
		};
	}
	if (address) {
		contact = {
			...contact,
			address: { createMany: { data: address } }
		};
	}
	if (email && phone) {
		contact = {
			...contact,
			email: { createMany: { data: email } },
			phone: { createMany: { data: phone } }
		};
	}
	if (email && address) {
		contact = {
			...contact,
			email: { createMany: { data: email } },
			address: { createMany: { data: address } }
		};
	}
	if (phone && address) {
		contact = {
			...contact,
			phone: { createMany: { data: phone } },
			address: { createMany: { data: address } }
		};
	}
	if (email && phone && address) {
		contact = {
			...contact,
			email: { createMany: { data: email } },
			phone: { createMany: { data: phone } },
			address: { createMany: { data: address } }
		};
	}

	return contact;
};

