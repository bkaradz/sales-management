import type { PageServerLoad } from './$types';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    register: async ({request}) => {
        const data = await request.formData();
        console.log("🚀 ~ file: +page.server.ts:10 ~ signUp: ~ data:", data)
    }
};