import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import { saveContactsSchema, updateContactsSchema } from '$lib/validation/contacts.zod';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';

export const load = (async (event) => {
    
        const contactResults = await router.createCaller(await createContext(event)).contacts.getById(+event.params.id);

        const contact = {
            ...contactResults?.contact,
            phones: '',
            emails: '',
            address: ''
        }

        if (contactResults) {
            
            contact.phones = contactResults?.phones.map(phone => phone.phone).toString() || ''

            contact.emails = contactResults?.emails.map(email => email.email).toString() || ''

            contact.address = contactResults?.address.map(address => address.address).toString() || ''
        }


    return { 
        results: contact
    };
}) satisfies PageServerLoad;


export const actions: Actions = {
	update: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)
       
        let formResults = {}

		if (formData?.id) formResults = { ...formResults, id: +formData.id }
		if (formData?.full_name) formResults = { ...formResults, full_name: formData.full_name }
		if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
		if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
		if (formData?.address) formResults = { ...formResults, address: normalizeAddress(formData.address as string) }
		if (formData?.is_corporate) formResults = { ...formResults, is_corporate: formData.is_corporate === 'on' ? true : false }
		if (formData?.vat_or_bp_number) formResults = { ...formResults, vat_or_bp_number: formData.vat_or_bp_number }

        try {

			const parsedContact = updateContactsSchema.safeParse(formResults);

			if (!parsedContact.success) {

				const errorMap = zodErrorMessagesMap(parsedContact);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await router.createCaller(await createContext(event)).contacts.updateContact(parsedContact.data)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}	
	}
};