import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveProductsArraySchema, saveProductsSchema } from '$lib/validation/product.zod';
import type { Products } from '$lib/server/drizzle/schema/schema';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;


export const actions: Actions = {
	upload: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			redirect(303, "/auth/login");
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

		productsArray.forEach((product: Products) => {
			let formResults = {}

			if (product?.stitches) formResults = { ...formResults, stitches: +product.stitches }
			if (product?.description) formResults = { ...formResults, description: product.description }
			if (product?.stork_quantity) formResults = { ...formResults, stork_quantity: +product.stork_quantity }
			if (product?.product_category) formResults = { ...formResults, product_category: product.product_category }
			if (product?.name) formResults = { ...formResults, name: product.name }
			if (product?.product_unit_price) {
				const unitPrice = product.product_unit_price

				if (+unitPrice > 0) {
					formResults = { ...formResults, product_unit_price: unitPrice }
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
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.stitches) formResults = { ...formResults, stitches: +formData.stitches }
		if (formData?.description) formResults = { ...formResults, description: formData.description }
		if (formData?.stork_quantity) formResults = { ...formResults, stork_quantity: +formData.stork_quantity }
		if (formData?.product_category) formResults = { ...formResults, product_category: formData.product_category }
		if (formData?.name) formResults = { ...formResults, name: formData.name }
		if (formData?.product_unit_price) {
			const productUnitPrice = formData.product_unit_price

			if ((+productUnitPrice > 0)) {
				formResults = { ...formResults, product_unit_price: productUnitPrice }
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