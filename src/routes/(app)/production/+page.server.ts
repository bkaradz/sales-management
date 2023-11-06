import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PaymentStatus, ProductionStatus, SalesStatus } from '$lib/utility/calculateCart.util';

export const load = (async (event) => {

	let query = {}

	const limit = event.url.searchParams.get('limit')
	if (limit) query = { ...query, limit: +limit }

	const page = event.url.searchParams.get('page')
	if (page) query = { ...query, page: +page }

	const search = event.url.searchParams.get('search')
	if (search) query = { ...query, search }
	
	const orders = async (query: any) => {
			return await router.createCaller(await createContext(event)).orders.getProductionOrders(query);
	};

	return {
		results: orders(query)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async (event) => {

			const session = await event.locals.auth.validate()

			if (!session) {
					throw redirect(303, "/auth/login")
			}

			const data = await event.request.formData();
			const formData = Object.fromEntries(data) as {id: string, payment_status: PaymentStatus, sales_status: SalesStatus, production_status: ProductionStatus}
			

			// return await router.createCaller(await createContext(event)).orders.deleteById(+formData.delete)
	},
	productionStatus: async (event) => {

			const session = await event.locals.auth.validate()

			if (!session) {
					throw redirect(303, "/auth/login")
			}

			const data = await event.request.formData();
			const formData = Object.fromEntries(data) as {id: string, payment_status: PaymentStatus, sales_status: SalesStatus, production_status: ProductionStatus}

			return await router.createCaller(await createContext(event)).orders.changeProductionStatusById({...formData, id: +formData.id})
	}
}