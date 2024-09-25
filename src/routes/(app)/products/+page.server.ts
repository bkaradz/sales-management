import { lucia } from '$lib/server/lucia/client';
import { deleteById as productsDeleteById } from '$lib/server/routes/products/products.drizzle';
import { trpcServer } from '$lib/server/server';
import type { Actions, PageServerLoad } from './$types';


import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {

	let query = {}

	const limit = event.url.searchParams.get('limit')
	if (limit) query = { ...query, limit: +limit }

	const page = event.url.searchParams.get('page')
	if (page) query = { ...query, page: +page }

	const search = event.url.searchParams.get('search')
	if (search) query = { ...query, search }

	const [productsPromise] = await Promise.all([
		await trpcServer.products.getProducts.ssr(query, event)
	]);

	return {
		results: productsPromise
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData();
		const formData = Object.fromEntries(data)

		return await productsDeleteById(+formData.delete, event)

	}
}