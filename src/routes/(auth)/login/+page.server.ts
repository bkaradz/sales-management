import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { loginCredentialsSchema } from '$lib/trpc/routes/authentication/authentication.validate';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async ({ locals }) => {

    const { session } = await locals.auth.validateUser()

    if (session) throw redirect(302, "/")

    return {};

}) satisfies PageServerLoad;

export const actions = {
    login: async (event) => {
        const data = await event.request.formData();

        const formData = Object.fromEntries(data)

        try {
            const parsedUser = loginCredentialsSchema.safeParse(formData);
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            await router.createCaller(await createContext(event)).authentication.loginUser(parsedUser.data)

        } catch (error) {
            return fail(400, {
                message: 'Could not login user',
                errors: { error }
            })

        }

        throw redirect(302, "/")
    }
};