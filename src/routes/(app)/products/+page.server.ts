import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia/client';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    default: async (event) => {
        await router.createCaller(await createContext(event)).authentication.logoutUser()
	}
    // default: async ({ locals }) => {
	// 	const { session } = await locals.auth.validateUser();
	// 	if (!session) return fail(401);
	// 	await auth.invalidateSession(session.sessionId); // invalidate session
	// 	locals.auth.setSession(null); // remove cookie
	// }
};