import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async () => {
    redirect(302, '/');
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        await router.createCaller(await createContext(event)).authentication.logoutUser()
    },
}