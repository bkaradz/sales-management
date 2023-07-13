import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { userRegisterSchema } from '$lib/validation/userRegister.validate';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    register: async ({ request }) => {
        const data = await request.formData();
        const formData = Object.fromEntries(data)
        console.log("🚀 ~ file: +page.server.ts:10 ~ signUp: ~ data:", data)
        console.log("🚀 ~ file: +page.server.ts:11 ~ register: ~ formData:", formData)
        try {
            const parsedUser = userRegisterSchema.safeParse(formData);
            console.log("🚀 ~ file: +page.server.ts:16 ~ register: ~ parsedUser:", parsedUser)
            if (!parsedUser.success) {
                const errorMap = zodErrorMessagesMap(parsedUser);
                console.log("🚀 ~ file: +page.server.ts:16 ~ register: ~ parsedUser:", parsedUser.error)
                console.log("🚀 ~ file: +page.server.ts:21 ~ register: ~ errorMap:", errorMap)
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }
        } catch (error) {
            
        }
    }
};