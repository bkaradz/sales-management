import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    const product = async () => {
        return await router.createCaller(await createContext(event)).products.getById(+event.params.id);
    }

    return {
        results: product()
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)
        formData.id = +formData.id as any
	
		return await router.createCaller(await createContext(event)).products.updateProduct(formData)

	}
};