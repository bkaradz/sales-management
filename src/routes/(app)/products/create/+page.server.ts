import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveProductsSchema } from '$lib/validation/product.zod';
import { greaterThan, type DineroSnapshot, dinero } from 'dinero.js';
import { dollars } from '$lib/utility/calculateCart.util';

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


		let formResults = {}

		if (formData?.stitches) formResults = { ...formResults, stitches: +formData.stitches }
		if (formData?.description) formResults = { ...formResults, description: formData.description }
		if (formData?.quantity) formResults = { ...formResults, quantity: +formData.quantity }
		if (formData?.product_category) formResults = { ...formResults, product_category: formData.product_category }
		if (formData?.name) formResults = { ...formResults, name: formData.name }
		if (formData?.unit_price) {
			const unitPrice = JSON.parse(formData.unit_price as string) as DineroSnapshot<number>

			if (greaterThan(dinero(unitPrice), dollars(0))) {
				formResults = { ...formResults, unit_price: unitPrice }
			}
		}

		try {
			const parsedProduct = saveProductsSchema.safeParse(formResults);

			if (!parsedProduct.success) {

				const errorMap = zodErrorMessagesMap(parsedProduct);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await router.createCaller(await createContext(event)).products.createProduct(parsedProduct.data)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}
	}
};