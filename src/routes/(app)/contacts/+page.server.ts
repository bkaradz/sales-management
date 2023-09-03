import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
        const { user } = await locals.auth.validateUser()

		if (!user) {
			throw redirect(303, "/auth/login")
		}

        const data = await request.formData();
        const formData = Object.fromEntries(data)
        console.log("🚀 ~ file: +page.server.ts:25 ~ next_page: ~ formData:", formData.next_page)
    },

    previous_page: async ({ request, locals }) => {
        const { user } = await locals.auth.validateUser()

		if (!user) {
			throw redirect(303, "/auth/login")
		}

        const data = await request.formData();
        const formData = Object.fromEntries(data)
        console.log("🚀 ~ file: +page.server.ts:37 ~ previous_page: ~ formData:", formData.previous_page)
    }
}