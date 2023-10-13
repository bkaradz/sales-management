import type { pricelistCombined } from '$lib/utility/calculateCart.util';
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

function cartStore() {
	const { subscribe, set, update } = writable<[]>([]);

	return {
		subscribe,
		add: () => {},
		remove: () => {},
		reset: () => set([])
	};
}

export const cart = cartStore();


function pricelistSt() {
	const { subscribe, set, update } = writable<pricelistCombined>();

	return {
		subscribe,
		add: (pricelist: any) => {
			update(() => pricelist)
		},
		// remove: () => {
		// 	update(() => new Map())
		// },
		// reset: () => set(new Map())
	};
}

export const pricelistStore = pricelistSt();

function exchangeRatesSt() {
	const { subscribe, set, update } = writable();

	return {
		subscribe,
		add: (exchangeRates: any) => {
			update(() => exchangeRates)
		},
		// reset: () => set(new Map())
	};
}

export const exchangeRatesStore = exchangeRatesSt();
