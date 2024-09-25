

import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import { updateContactsSchema } from '$lib/validation/contacts.zod';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { updateContact, type GetContactsById } from '$lib/server/routes/contacts/contacts.drizzle';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';

export const load = (async (event) => {

	const processContacts = (contactResults: GetContactsById | undefined) => {

		if (!contactResults) throw new Error("Contact results not found");

		const contact = {
			...contactResults?.contact,
			phones: '',
			emails: '',
			address: ''
		}

		contact.phones = contactResults?.phones.map(phone => phone.phone).join(',') || ''

		contact.emails = contactResults?.emails.map(email => email.email).join(',') || ''

		contact.address = contactResults?.address.map(address => address.address).join(',') || ''

		return contact

	}

	const [contactPromise] = await Promise.all([
		await trpcServer.contacts.getById.ssr(+event.params.id, event)
	]);

	return {
		results: processContacts(contactPromise)
	};
}) satisfies PageServerLoad;


export const actions: Actions = {
	update: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.id) formResults = { ...formResults, id: +formData.id }
		if (formData?.fullName) formResults = { ...formResults, fullName: formData.fullName }
		if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
		if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
		if (formData?.address) formResults = { ...formResults, address: normalizeAddress(formData.address as string) }
		if (formData?.isCorporate) formResults = { ...formResults, isCorporate: formData.isCorporate === 'on' ? true : false }
		if (formData?.vatOrBpNumber) formResults = { ...formResults, vatOrBpNumber: formData.vatOrBpNumber }

		try {

			const parsedContact = updateContactsSchema.safeParse(formResults);

			if (!parsedContact.success) {

				const errorMap = zodErrorMessagesMap(parsedContact);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await updateContact(parsedContact.data, event)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}
	}
};