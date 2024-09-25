

import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveProductsSchema } from '$lib/validation/product.zod';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';
import { uploadProducts } from '$lib/server/routes/products/products.drizzle';

export const load = (async (event) => {

	const [productsPromise] = await Promise.all([
		await trpcServer.products.getById.ssr(+event.params.id, event)
	]);

	return {
		results: productsPromise
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData()
		const formData = Object.fromEntries(data)

		let formResults = {}

		if (formData?.id) formResults = { ...formResults, id: +formData.id }
		if (formData?.stitches) formResults = { ...formResults, stitches: +formData.stitches }
		if (formData?.description) formResults = { ...formResults, description: formData.description }
		if (formData?.quantity) formResults = { ...formResults, quantity: +formData.quantity }
		if (formData?.productCategory) formResults = { ...formResults, productCategory: formData.productCategory }
		if (formData?.name) formResults = { ...formResults, name: formData.name }
		if (formData?.unitPrice) {
			const unitPrice = formData.unitPrice

			if (+unitPrice > 0) {
				formResults = { ...formResults, unitPrice: unitPrice }
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
			// Todo: Correct args
			return await uploadProducts(parsedProduct.data, event)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}



	}
};