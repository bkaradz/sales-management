import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const orders = async (query: any) => {
        return await router.createCaller(await createContext(event)).orders.getOrdersAwaitingPaymentByUserId({...query, id: parseInt(event.params.id, 10)});
    }

    const contact = async () => {
        return await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id, 10));
    };
    
    return {
        contact: contact(),
        orders: orders(query)
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
	submit: async (event) => {

			const session = await event.locals.auth.validate()

			if (!session) {
					throw redirect(303, "/auth/login")
			}

			const data = await event.request.formData();
			const formData = Object.fromEntries(data)
			console.log("🚀 ~ file: +page.server.ts:44 ~ submit: ~ formData:", formData)

			// return await router.createCaller(await createContext(event)).orders.deleteById({...formData, id: +formData.id})
	}
}