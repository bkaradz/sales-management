import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({locals}) => {
    
    const { session } = await locals.auth.validateUser()

    if (!session) throw redirect(302, "/login")

    return {};
    
}) satisfies LayoutServerLoad;