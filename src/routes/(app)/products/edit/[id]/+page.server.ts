import { createContext } from '$lib/trpc/context';
import { router } from '$lib/server/routes/router';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveProductsSchema } from '$lib/validation/product.zod';

export const load = (async (event) => {

	const [productsPromise] = await Promise.all([
		await router.createCaller(await createContext(event)).products.getById(+event.params.id),
	]);

	return {
		results: productsPromise
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {

		const session = await event.locals.auth.validate()

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
		if (formData?.product_category) formResults = { ...formResults, product_category: formData.product_category }
		if (formData?.name) formResults = { ...formResults, name: formData.name }
		if (formData?.unit_price) {
			const unitPrice = formData.unit_price

			if (+unitPrice > 0) {
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

			return await router.createCaller(await createContext(event)).products.updateProduct(parsedProduct.data)

		} catch (error) {
			return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
		}



	}
};