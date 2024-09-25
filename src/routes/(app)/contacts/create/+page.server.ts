
import type { PageServerLoad } from './$types';

import { fail, redirect, type Actions } from '@sveltejs/kit';
import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveContactsArraySchema, saveContactsSchema } from '$lib/validation/contacts.zod';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import type { Contacts } from '$lib/server/drizzle/schema/schema';
import { createContact, uploadContacts } from '$lib/server/routes/contacts/contacts.drizzle';
import { lucia } from '$lib/server/lucia/client';

export const load = (async (event) => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	upload: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const file = data.get('contacts') as File

		if (!(file instanceof File)) {
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

		const csvString = (await file.text()) as string;

		const contactsArray = (await parseCsv(csvString)) as any[]

		const contactsResultsArray: Contacts[] = []

		contactsArray.forEach((customer) => {
			let formResults = {}

			if (customer?.fullName) formResults = { ...formResults, fullName: customer.fullName }
			if (customer?.email) formResults = { ...formResults, email: normalizeEmail(customer.email as string) }
			if (customer?.phone) formResults = { ...formResults, phone: normalizePhone(customer.phone as string) }
			if (customer?.address) formResults = { ...formResults, address: normalizeAddress(customer.address as string) }
			if (customer?.isCorporate) formResults = { ...formResults, isCorporate: customer.isCorporate }
			if (customer?.vatOrBpNumber) formResults = { ...formResults, vatOrBpNumber: customer.vatOrBpNumber }

			contactsResultsArray.push(formResults as Contacts)
		})

		try {

			const parsedContact = saveContactsArraySchema.safeParse(contactsResultsArray);

			if (!parsedContact.success) {

				const errorMap = zodErrorMessagesMap(parsedContact);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await uploadContacts(parsedContact.data, event)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}



	},

	create: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.fullName) formResults = { ...formResults, fullName: formData.fullName }
		if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
		if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
		if (formData?.address) formResults = { ...formResults, addresses: normalizeAddress(formData.address as string) }
		if (formData?.isCorporate) formResults = { ...formResults, isCorporate: formData.isCorporate === 'on' ? true : false }
		if (formData?.vatOrBpNumber) formResults = { ...formResults, vatOrBpNumber: formData.vatOrBpNumber }

		try {

			const parsedContact = saveContactsSchema.safeParse(formResults);

			if (!parsedContact.success) {

				const errorMap = zodErrorMessagesMap(parsedContact);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await createContact(parsedContact.data, event)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}
	}
};