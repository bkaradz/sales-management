import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveContactsSchema } from '$lib/validation/contacts.zod';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';

export const load = (async (event) => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	upload: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
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

		return await router.createCaller(await createContext(event)).contacts.uploadContacts(contactsArray)

	},

	create: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.full_name) formResults = { ...formResults, full_name: formData.full_name }
		if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
		if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
		if (formData?.address) formResults = { ...formResults, address: normalizeAddress(formData.address as string) }
		if (formData?.is_corporate) formResults = { ...formResults, is_corporate: formData.is_corporate }
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