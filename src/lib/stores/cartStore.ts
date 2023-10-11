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


function pricelistStore() {
	const { subscribe, set, update } = writable();

	return {
		subscribe,
		add: (pricelist: any) => {
			update(() => pricelist)
		},
		remove: () => {
			update(() => new Map())
		},
		reset: () => set(new Map())
	};
}

export const pricelist = pricelistStore();
