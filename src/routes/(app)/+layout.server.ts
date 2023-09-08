import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/lucia/client';
import { db } from '$lib/server/drizzle/client';
import { users } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ locals }) => {

    const session = await locals.auth.validate()

    if (!session) throw redirect(302, "/login")

    const user = await db.select().from(users).where(eq(users.id, session.user.userId));

    return { user: user[0] };

}) satisfies LayoutServerLoad;
