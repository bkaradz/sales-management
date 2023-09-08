import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load = (async (event) => {
    const contacts = async () => {
        return await router.createCaller(await createContext(event)).contacts.getContacts({});
    };
    return {
        contacts: contacts()
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