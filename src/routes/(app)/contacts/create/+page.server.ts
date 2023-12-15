import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveContactsArraySchema, saveContactsSchema } from '$lib/validation/contacts.zod';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import type { Contacts } from '$lib/server/drizzle/schema/schema';

export const load = (async (event) => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	upload: async (event) => {

		const session = await event.locals.auth.validate()

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

			if (customer?.full_name) formResults = { ...formResults, full_name: customer.full_name }
			if (customer?.email) formResults = { ...formResults, email: normalizeEmail(customer.email as string) }
			if (customer?.phone) formResults = { ...formResults, phone: normalizePhone(customer.phone as string) }
			if (customer?.address) formResults = { ...formResults, address: normalizeAddress(customer.address as string) }
			if (customer?.is_corporate) formResults = { ...formResults, is_corporate: customer.is_corporate }
			if (customer?.vat_or_bp_number) formResults = { ...formResults, vat_or_bp_number: customer.vat_or_bp_number }

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

			return await router.createCaller(await createContext(event)).contacts.uploadContacts(parsedContact.data)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}



	},

	create: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.full_name) formResults = { ...formResults, full_name: formData.full_name }
		if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
		if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
		if (formData?.address) formResults = { ...formResults, addresses: normalizeAddress(formData.address as string) }
		if (formData?.is_corporate) formResults = { ...formResults, is_corporate: formData.is_corporate === 'on' ? true : false }
		if (formData?.vat_or_bp_number) formResults = { ...formResults, vat_or_bp_number: formData.vat_or_bp_number }

		try {

			const parsedContact = saveContactsSchema.safeParse(formResults);

			if (!parsedContact.success) {

				const errorMap = zodErrorMessagesMap(parsedContact);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await router.createCaller(await createContext(event)).contacts.createContact(parsedContact.data)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}
	}
};