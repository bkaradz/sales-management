import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PaymentStatusUnion, ProductionStatusUnion, SalesStatusUnion } from '$lib/utility/lists.utility';

export const load = (async (event) => {

	let query = {}

	const limit = event.url.searchParams.get('limit')
	if (limit) query = { ...query, limit: +limit }

	const page = event.url.searchParams.get('page')
	if (page) query = { ...query, page: +page }

	const search = event.url.searchParams.get('search')
	if (search) query = { ...query, search }

	const [shopOrdersPromise] = await Promise.all([
		await router.createCaller(await createContext(event)).production.getProductionOrders(query)
	]);

	return {
		results: shopOrdersPromise
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData();
		const formData = Object.fromEntries(data) as { id: string, payment_status: PaymentStatusUnion, sales_status: SalesStatusUnion, production_status: ProductionStatusUnion }


		// return await router.createCaller(await createContext(event)).shop_orders.deleteById(+formData.delete)
	},
	productionStatus: async (event) => {

		const session = await event.locals.auth.validate()

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData();
		const formData = Object.fromEntries(data) as { id: string, payment_status: PaymentStatusUnion, sales_status: SalesStatusUnion, production_status: ProductionStatusUnion }

		return await router.createCaller(await createContext(event)).production.changeProductionStatusById({ ...formData, id: +formData.id })
	}
}