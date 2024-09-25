

import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';
import { deleteById as contactsDeleteById} from '$lib/server/routes/contacts/contacts.drizzle';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const [contacts] = await Promise.all([
        await trpcServer.contacts.getContactsList.ssr(query, event)
    ]);

    return {
        results: contacts
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    delete: async (event) => {

        const { session } = await lucia.validateSession(event.locals.session?.id || "");

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data)

        return await contactsDeleteById(+formData.delete, event)

    }
}