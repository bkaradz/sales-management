import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PaymentStatus, SalesStatus } from '$lib/validation/types.zod.typescript';

export const load = (async (event) => {

	let query = {}

	const limit = event.url.searchParams.get('limit')
	if (limit) query = { ...query, limit: +limit }

	const page = event.url.searchParams.get('page')
	if (page) query = { ...query, page: +page }

	const search = event.url.searchParams.get('search')
	if (search) query = { ...query, search }
	
	const orders = async (query: any) => {
			return await router.createCaller(await createContext(event)).orders.getOrders(query);
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
			const formData = Object.fromEntries(data) as {id: string, payment_status: PaymentStatus, sales_status: SalesStatus}

			return await router.createCaller(await createContext(event)).orders.deleteById({...formData, id: +formData.id})
	},
	salesStatus: async (event) => {

			const session = await event.locals.auth.validate()

			if (!session) {
					throw redirect(303, "/auth/login")
			}

			const data = await event.request.formData();
			const formData = Object.fromEntries(data) as {id: string, sales_status: SalesStatus, payment_status: PaymentStatus}

			return await router.createCaller(await createContext(event)).orders.changeSalesStatusById({...formData, id: +formData.id})
	}
}