

import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PaymentStatusUnion, ProductionStatusUnion, SalesStatusUnion } from '$lib/utility/lists.utility';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';
import { deleteById as shopOrdersDeleteById} from '$lib/server/routes/orders/orders.drizzle';

export const load = (async (event) => {

	let query = {}

	const limit = event.url.searchParams.get('limit')
	if (limit) query = { ...query, limit: +limit }

	const page = event.url.searchParams.get('page')
	if (page) query = { ...query, page: +page }

	const search = event.url.searchParams.get('search')
	if (search) query = { ...query, search }

	const [shopOrdersPromise] = await Promise.all([
		await trpcServer.production.getProductionOrders.ssr(query, event)
	]);

	return {
		results: shopOrdersPromise
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData();
		const formData = Object.fromEntries(data) as { id: string, paymentStatus: PaymentStatusUnion, salesStatus: SalesStatusUnion, productionStatus: ProductionStatusUnion }

		// Todo: correct args
		return await shopOrdersDeleteById(+formData.delete, event)
	},
	productionStatus: async (event) => {

		const { session } = await lucia.validateSession(event.locals.session?.id || "");

		if (!session) {
			redirect(303, "/auth/login");
		}

		const data = await event.request.formData();
		const formData = Object.fromEntries(data) as { id: string, paymentStatus: PaymentStatusUnion, salesStatus: SalesStatusUnion, productionStatus: ProductionStatusUnion }

		return await trpcServer.production.changeProductionStatusById.ssr({ ...formData, id: +formData.id }, event)
	}
}