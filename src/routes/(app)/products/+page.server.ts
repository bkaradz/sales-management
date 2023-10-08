import type { Actions, PageServerLoad } from './$types';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {

	let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

	const products = async (query: any) => {
		return await router.createCaller(await createContext(event)).products.getProducts(query);
	}
    return {
		results: products(query)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async (event) => {

			const session = await event.locals.auth.validate()

			if (!session) {
					throw redirect(303, "/auth/login")
			}

			const data = await event.request.formData();
			const formData = Object.fromEntries(data)
			
			return await router.createCaller(await createContext(event)).products.deleteById(+formData.delete)

	}
}