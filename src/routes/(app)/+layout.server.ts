import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

    const session = await event.locals.auth.validate()

    if (!session) redirect(302, "/login");

    const [user] = await Promise.all([
        await router.createCaller(await createContext(event)).authentication.getById(session.user.userId)
    ]);

    return {
        user
    };

}) satisfies LayoutServerLoad;
