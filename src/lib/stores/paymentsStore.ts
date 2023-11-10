import type { Orders } from '$lib/server/drizzle/schema';
import { addMany, dollars, subtractMany, type SalesStatus, type PaymentMethod } from '$lib/utility/calculateCart.util';
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

function amountTendered() {
	const { subscribe, set, update } = writable<number>(0);

	return {
		subscribe,
		add: (amount: number) => {
			update(() => amount)
		},
		reset: () => set(0)
	};
}

export const amountTenderedStore = amountTendered();

export const selectedOrdersPaymentTotals = derived([selectedOrdersPaymentStore, amountTenderedStore], ([$selectedOrdersPaymentStore, $amountTenderedStore]) => {
	const totalArray = [dollars(0)]
	const salesAmountArray = [...$selectedOrdersPaymentStore.values()].map((item) => dinero(item.sales_amount))
	const salesAmountTotal = addMany([...totalArray, ...salesAmountArray])
	const totalProducts = [...$selectedOrdersPaymentStore.values()].reduce((accumulator, currentValue) => accumulator + currentValue.total_products, 0)

	return {
		selectedOrdersTotal: salesAmountTotal,
		amountTendered: dollars($amountTenderedStore * 1000),
		totalDue: subtractMany([salesAmountTotal, dollars($amountTenderedStore * 1000)]),
		totalProducts
	}
})

function paymentMethodSelected() {
	const { subscribe, set, update } = writable<PaymentMethod>('Cash USD');

	return {
		subscribe,
		add: (paymentMethod: PaymentMethod | undefined) => {
			if (paymentMethod) {
				if (paymentMethod) {
					update(() => paymentMethod)
				}
			}
		},
		reset: () => set('Cash USD')
	};
}

export const paymentMethodSelectedStore = paymentMethodSelected();




