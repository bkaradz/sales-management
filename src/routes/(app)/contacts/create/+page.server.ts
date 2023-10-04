import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { fail,  redirect, type Actions } from '@sveltejs/kit';
import parseCsv from '$lib/utility/parseCsv';

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
	

		return await router.createCaller(await createContext(event)).contacts.createContact(formData)

	}
};