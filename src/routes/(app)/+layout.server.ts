import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async ({ locals }) => {

    const { user } = await locals.auth.validateUser()

    if (!user) throw redirect(302, "/login")

    return { user };

}) satisfies LayoutServerLoad;
