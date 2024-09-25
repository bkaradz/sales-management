import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { userRegisterSchema } from '$lib/server/routes/authentication/authentication.validate';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { trpcServer } from '$lib/server/server';
import { registerUser } from '$lib/server/routes/authentication/authentication.drizzle';



export const load = (async (event) => {

    if (event.locals.user) {
		return redirect(302, "/");
	}
	return {};

}) satisfies PageServerLoad;

export const actions = {
    register: async (event) => {
        const data = await event.request.formData();
        const formData = Object.fromEntries(data)

        try {
            const parsedUser = userRegisterSchema.safeParse(formData);
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            await registerUser(parsedUser.data)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }

        redirect(302, "/login");
    },
    logout: async (event) => {
        await trpcServer.authentication.logoutUser.ssr(event)
    }
};