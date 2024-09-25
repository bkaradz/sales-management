import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


import parseCsv from '$lib/utility/parseCsv';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveProductsArraySchema, saveProductsSchema } from '$lib/validation/product.zod';
import type { Products } from '$lib/server/drizzle/schema/schema';
import { createProduct, uploadProducts } from '$lib/server/routes/products/products.drizzle';
import { lucia } from '$lib/server/lucia/client';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;


export const actions: Actions = {
	upload: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

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
			if (product?.storkQuantity) formResults = { ...formResults, storkQuantity: +product.storkQuantity }
			if (product?.productCategory) formResults = { ...formResults, productCategory: product.productCategory }
			if (product?.name) formResults = { ...formResults, name: product.name }
			if (product?.productUnitPrice) {
				const unitPrice = product.productUnitPrice

				if (+unitPrice > 0) {
					formResults = { ...formResults, productUnitPrice: unitPrice }
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

			return await uploadProducts(parsedProduct.data, event)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}

	},

	create: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.stitches) formResults = { ...formResults, stitches: +formData.stitches }
		if (formData?.description) formResults = { ...formResults, description: formData.description }
		if (formData?.storkQuantity) formResults = { ...formResults, storkQuantity: +formData.storkQuantity }
		if (formData?.productCategory) formResults = { ...formResults, productCategory: formData.productCategory }
		if (formData?.name) formResults = { ...formResults, name: formData.name }
		if (formData?.productUnitPrice) {
			const productUnitPrice = formData.productUnitPrice

			if ((+productUnitPrice > 0)) {
				formResults = { ...formResults, productUnitPrice: productUnitPrice }
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

			return await createProduct(parsedProduct.data, event)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}
	}
};