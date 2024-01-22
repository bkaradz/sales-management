import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { trpcServer } from '$lib/server/server';

export const load = (async (event) => {

    const session = await event.locals.auth.validate()

    if (!session) redirect(302, "/login");

    const [user] = await Promise.all([
        await trpcServer.authentication.getById.ssr(session.user.userId, event),
    ]);

    return {
        user
    };

}) satisfies LayoutServerLoad;
