import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
    
        const contactResults = await router.createCaller(await createContext(event)).contacts.getById(+event.params.id);
        console.log("🚀 ~ file: +page.server.ts:8 ~ load ~ contactResults:", contactResults)

        const contact = {
            contact: contactResults?.contact,
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
			throw redirect(303, "/auth/login")
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)
		console.log("🚀 ~ file: +page.server.ts:48 ~ create: ~ formData:", formData)
	
		return await router.createCaller(await createContext(event)).contacts.updateContact(formData)

	}
};