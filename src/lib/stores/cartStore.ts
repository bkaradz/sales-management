import type { Contacts, Products } from '$lib/server/drizzle/schema';
import { addMany, calcPrice, dollars, type embTypekey, type PricelistCombinedMap } from '$lib/utility/calculateCart.util';
import type { ExchangeRateCombinedMap } from '$lib/utility/monetary.util';
import { multiply, type Dinero } from 'dinero.js';
import { writable, derived } from 'svelte/store';

function cart() {
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
		subtract: (product: Products) => {
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
		removeProduct: (id: number) => {
			update((productMap) => {
				productMap.delete(id)
				return productMap
			})
		},
		changeEmbType: ({ id, type }: { id: number, type: embTypekey }) => {
			update((productMap) => {
				const productGet = productMap.get(id) as Products
				productGet.embroidery_type = type
				return productMap
			})
		},
		reset: () => set(new Map())
	};
}

export const cartStore = cart();

function customerSelected() {
	const { subscribe, set, update } = writable<Contacts | null>(null);

	return {
		subscribe,
		add: (customer: Contacts) => {
			update(() => customer)
		},
	};
}

export const customerSelectedStore = customerSelected();

function pricelist() {
	const { subscribe, set, update } = writable<PricelistCombinedMap>();

	return {
		subscribe,
		add: (pricelist: PricelistCombinedMap) => {
			update(() => pricelist)
		},
	};
}

export const pricelistStore = pricelist();

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

function exchangeRates() {
	const { subscribe, set, update } = writable<ExchangeRateCombinedMap>();

	return {
		subscribe,
		add: (exchangeRates: ExchangeRateCombinedMap) => {
			update(() => exchangeRates)
		},
	};
}

export const exchangeRatesStore = exchangeRates();

// TODO: Change to selected currency
function selectedRate() {
	const { subscribe, set, update } = writable<string>('USD');

	return {
		subscribe,
		add: (rate: string) => {
			update(() => rate)
		},
	};
}

export const selectedRateStore = selectedRate();

type CartResults = {
	total_price: Dinero<number>;
	unit_price: Dinero<number>;
	quantity: number;
	stitches: number;
	pricelist_id: number;
	product_id: number;
}

export const cartPricesStore = derived([cartStore, pricelistStore], ([$cartStore, $pricelistStore]) => {
	const cartResults = new Map<number, CartResults>()

	$cartStore.forEach((value, key) => {
		const results = calcPrice(value, $pricelistStore, value.quantity || 0, value.embroidery_type as embTypekey)
		cartResults.set(value.id, results)
	})

	return cartResults
})

export const cartTotalsStore = derived([cartPricesStore, vatStore], ([$cartPricesStore, $vatStore]) => {

	let totalArray: Dinero<number>[] = [dollars(0)]

	$cartPricesStore.forEach((value, key) => {
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

