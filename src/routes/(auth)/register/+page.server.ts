import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { userRegisterSchema } from '$lib/trpc/routes/authentication/authentication.validate';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';

export const load = (async ({ locals }) => {

    const session = await locals.auth.validate()

    if (session) redirect(302, "/");

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

            await router.createCaller(await createContext(event)).authentication.registerUser(parsedUser.data)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }

        redirect(302, "/login");
    },
    logout: async (event) => {
        await router.createCaller(await createContext(event)).authentication.logoutUser()
    }
};