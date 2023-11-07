import type { Orders } from '$lib/server/drizzle/schema';
import { addMany, dollars } from '$lib/utility/calculateCart.util';
import { converter } from '$lib/utility/currencyConvertor.util';
import { dinero, type Dinero } from 'dinero.js';
import { writable, derived } from 'svelte/store';

function selectedOrdersPayment() {
	const { subscribe, set, update } = writable<Map<number, Orders>>(new Map);

	return {
		subscribe,
		add: (order: Orders) => {
			update((ordersMap) => {
				if (ordersMap.has(order.id)) {
					return ordersMap
				} else {
					ordersMap.set(order.id, order)
					return ordersMap
				}
			})
		},
		remove: (id: number) => {
			update((ordersMap) => {
				ordersMap.delete(id)
				return ordersMap
			})
		},
		reset: () => set(new Map())
	};
}

export const selectedOrdersPaymentStore = selectedOrdersPayment();

export const selectedOrdersPaymentTotals = derived([selectedOrdersPaymentStore], ([$selectedOrdersPaymentStore]) => {
	const totalArray = [dollars(0)]
	const salesAmountArray = [...$selectedOrdersPaymentStore.values()].map((item) => dinero(item.sales_amount))
	const salesAmountTotal = addMany([...totalArray, ...salesAmountArray])
	const totalProducts = [...$selectedOrdersPaymentStore.values()].reduce((accumulator, currentValue) => accumulator + currentValue.total_products, 0)

	return {
		selectedOrdersTotal: salesAmountTotal,
		totalProducts
	}
})


type Currencies = "USD" | "BWP" | "ZAR" | "ZWR" | "ZWB"

function payments() {
	const { subscribe, set, update } = writable<Map<Currencies, {"amount": number, "default_currency": Dinero<number>}>>(new Map(
		[
			["USD", { "amount": 0, "default_currency": dollars(0) }],
			["BWP", { "amount": 0, "default_currency": dollars(0) }],
			["ZAR", { "amount": 0, "default_currency": dollars(0) }],
			["ZWR", { "amount": 0, "default_currency": dollars(0) }],
			["ZWB", { "amount": 0, "default_currency": dollars(0) }],
		]
	));

	return {
		subscribe,
		add: (payment: {currency: Currencies, amount: number}) => {
			update((paymentsMap) => {
				switch (payment.currency) {
					case 'ZAR':
						const usd = converter()
						break;
					case 'BWP':
						
						break;
					case 'ZWB':
						
						break;
					case 'ZWR':
						
						break;
				
					default:


						break;
				}
			})
		},
		reset: () => set(new Map(
			[
				["USD", { "amount": 0, "default_currency": dollars(0) }],
				["BWP", { "amount": 0, "default_currency": dollars(0) }],
				["ZAR", { "amount": 0, "default_currency": dollars(0) }],
				["ZWR", { "amount": 0, "default_currency": dollars(0) }],
				["ZWB", { "amount": 0, "default_currency": dollars(0) }],
			]
		))
	};
}

export const paymentsStore = payments();


