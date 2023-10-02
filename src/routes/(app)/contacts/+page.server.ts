import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }
    
    const contacts = async (query: any) => {
        return await router.createCaller(await createContext(event)).contacts.getContacts(query);
    };

    return {
        results: contacts(query)
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    next_page: async ({ request, locals }) => {
        const session = await locals.auth.validate()

        if (!session) {
            throw redirect(303, "/auth/login")
        }

        // let paramsTypes = {
        //     limit,
        //     page: 1,
        //     sort: 'name'
        // };

        const data = await request.formData();
        const formData = Object.fromEntries(data)
        // try {
        //     try {
        //         const contacts = await trpc().contacts.getContacts.query(paramsObj)
        //         return contacts;
        //     } catch (err: any) {
        //         console.error(`Error: ${err}`);
        //     }
        // } catch (err: any) {
        //     console.error(`Error: ${err}`);
        // }
    },

    previous_page: async ({ request, locals }) => {
        const session = await locals.auth.validate()

        if (!session) {
            throw redirect(303, "/auth/login")
        }

        const data = await request.formData();
        const formData = Object.fromEntries(data)
    }
}