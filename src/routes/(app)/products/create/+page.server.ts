import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import parseCsv from '$lib/utility/parseCsv';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	upload: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
		}

		const data = await event.request.formData()
		const file = data.get('products') as File

		if (!(file instanceof File)) {
			return fail(400, {
				message: 'File is empty',
				errors: {}
			})
		}

		const csvString = (await file.text()) as string;

		const productsArray = (await parseCsv(csvString)) as any[]

		return await router.createCaller(await createContext(event)).products.uploadProducts(productsArray)

	},

	create: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)
		console.log("🚀 ~ file: +page.server.ts:48 ~ create: ~ formData:", formData)

		if (!formData.description) {
			delete formData.description
		}

		// return await router.createCaller(await createContext(event)).products.createProduct(formData)

	}
};