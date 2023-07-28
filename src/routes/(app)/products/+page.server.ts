import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia/client';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';

export const load = (async (event) => {
	const products = async () => {
		return await router.createCaller(await createContext(event)).products.getProducts({});
	}
    return {
		products: products()
	};
}) satisfies PageServerLoad;

