import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';



export const load = (async (event) => {

    const { session } = await lucia.validateSession(event.locals.session?.id || "");

    if (!session) redirect(302, "/login");

    const [user] = await Promise.all([
        await trpcServer.authentication.getById.ssr(session.userId, event)
    ]);

    return {
        user
    };

}) satisfies LayoutServerLoad;
