import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveProductsArraySchema, saveProductsSchema } from '$lib/validation/product.zod';
import { greaterThan, type DineroSnapshot, dinero } from 'dinero.js';
import { dollars } from '$lib/utility/calculateCart.util';
import type { Products } from '$lib/server/drizzle/schema';

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


		let productsResultsArray: Products[] = []


		productsArray.forEach((product: any) => {
			let formResults = {}

			if (product?.stitches) formResults = { ...formResults, stitches: +product.stitches }
			if (product?.description) formResults = { ...formResults, description: product.description }
			if (product?.quantity) formResults = { ...formResults, quantity: +product.quantity }
			if (product?.product_category) formResults = { ...formResults, product_category: product.product_category }
			if (product?.name) formResults = { ...formResults, name: product.name }
			if (product?.unit_price) {
				const unitPrice = dollars(+product.unit_price * 1000)

				if (greaterThan(unitPrice, dollars(0))) {
					formResults = { ...formResults, unit_price: unitPrice.toJSON() }
				}
			}
			productsResultsArray.push(formResults as Products)
		})

		try {
			const parsedProduct = saveProductsArraySchema.safeParse(productsResultsArray);

			if (!parsedProduct.success) {

				const errorMap = zodErrorMessagesMap(parsedProduct);
				return fail(400, {
					message: 'Validation error',
					errors: errorMap
				})
			}

			return await router.createCaller(await createContext(event)).products.uploadProducts(parsedProduct.data)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}

	},

	create: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			throw redirect(303, "/auth/login")
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.stitches) formResults = { ...formResults, stitches: +formData.stitches }
		if (formData?.description) formResults = { ...formResults, description: formData.description }
		if (formData?.quantity) formResults = { ...formResults, quantity: +formData.quantity }
		if (formData?.product_category) formResults = { ...formResults, product_category: formData.product_category }
		if (formData?.name) formResults = { ...formResults, name: formData.name }
		if (formData?.unit_price) {
			const unitPrice = dollars(+formData.unit_price * 1000)

			if (greaterThan(unitPrice, dollars(0))) {
				formResults = { ...formResults, unit_price: unitPrice.toJSON() }
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