import type { Products } from '$lib/server/drizzle/schema';
import { addMany, calcPrice, dollars, type pricelistCombined } from '$lib/utility/calculateCart.util';
import { multiply, type Dinero } from 'dinero.js';
import { writable, derived } from 'svelte/store';

function cartStore() {
	const { subscribe, set, update } = writable<Map<number, Products>>(new Map);

	return {
		subscribe,
		add: (product: Products) => {
			update((productMap) => {
				if (productMap.has(product.id)) {
					const productGet = productMap.get(product.id) as Products
					if (productGet.quantity) {
						productGet.quantity = productGet.quantity + 1
					} else {
						productGet.quantity = 1
					}
					return productMap
				} else {
					product.quantity = 1
					productMap.set(product.id, product)
					return productMap
				}
			})
		},
		remove: (product: Products) => {
			update((productMap) => {
				if (productMap.has(product.id)) {
					const productGet = productMap.get(product.id) as Products
					if (productGet.quantity) {
						productGet.quantity = productGet.quantity - 1
						if (productGet.quantity === 0) {
							productMap.delete(product.id)
						}
					}
					return productMap
				} else {
					return productMap
				}
			})
		},
		reset: () => set(new Map())
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
	};
}

export const pricelistStore = pricelistSt();

function vat() {
	const { subscribe, set, update } = writable<number>(0);

	return {
		subscribe,
		add: (vat: any) => {
			update(() => vat)
		},
	};
}

export const vatStore = vat();

function exchangeRatesSt() {
	const { subscribe, set, update } = writable();

	return {
		subscribe,
		add: (exchangeRates: any) => {
			update(() => exchangeRates)
		},
	};
}

export const exchangeRatesStore = exchangeRatesSt();

type CartResults = {
	total_price: Dinero<number>;
	unit_price: Dinero<number>;
	quantity: number;
	stitches: number;
	pricelist_id: number;
	product_id: number;
}

export const cartPrices = derived([cart, pricelistStore], ([$cart, $pricelistStore]) => {
	const cartResults = new Map<number, CartResults>()

	$cart.forEach((value, key) => {
		const results = calcPrice(value, $pricelistStore, value.quantity || 0)
		cartResults.set(value.id, results)
	})

	return cartResults
})

export const cartTotals = derived([cartPrices, vatStore], ([$cartPrices, $vatStore]) => {

	let totalArray: Dinero<number>[] = [dollars(0)]
	
	$cartPrices.forEach((value, key) => {
		totalArray.push(value.total_price)
	})

	const total = addMany(totalArray)
	const vatTotal = multiply(total, { amount: ($vatStore * 1000), scale: 3 })

	return {
		sub_total: total,
		vat: vatTotal,
		grand_total: addMany([total, vatTotal])
	}
	
})

