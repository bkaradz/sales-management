import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/lucia/client';
import { db } from '$lib/server/drizzle/client';
import { users } from '$lib/server/drizzle/schema/schema';
import { eq } from 'drizzle-orm';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async (event) => {

    const session = await event.locals.auth.validate()

    if (!session) throw redirect(302, "/login")

    // TODO: change to trpc
    // const user = await db.select().from(users).where(eq(users.id, session.user.userId));

    // return { user: user[0] };

    const user = async () => {
        return await router.createCaller(await createContext(event)).authentication.getById(session.user.userId)
    };

    return {
        user: await user()
    };

}) satisfies LayoutServerLoad;
