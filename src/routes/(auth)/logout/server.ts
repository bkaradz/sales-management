import { auth } from '$lib/server/lucia/client';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { fail, redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from "./$types";


// export const POST = async (event) => {
//     try {
//         console.log('object');
//         await router.createCaller(await createContext(event)).authentication.logoutUser()

//     } catch (error) {
//         throw error(400, 'Could not log out');
//     }

//     throw redirect(303, `/`)
// };

export const POST: RequestHandler = async ({ locals }) => {

    const { session } = await locals.auth.validateUser()
    console.log("🚀 ~ file: +server.ts:23 ~ constPOST:RequestHandler= ~ session:", session)

    if (!session) throw redirect(302, "/");

    await auth.invalidateSession(session.sessionId)
    locals.auth.setSession(null)

    throw redirect(302, "/");

};