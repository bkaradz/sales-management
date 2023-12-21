import type { Contacts, NewPaymentsDetails, Orders } from '$lib/server/drizzle/schema/schema';
import type { OrdersByUserId } from '$lib/trpc/routes/orders/orders.drizzle';
import { addMany, subtractMany } from '$lib/utility/calculateCart.util';
import type { PaymentMethodUnion, currencyTypeUnion } from '$lib/utility/lists.utility';
import currency from 'currency.js';
import { writable, derived } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

function selectedOrdersPayment() {
	const { subscribe, set, update } = writable<Map<number, OrdersByUserId>>(new Map);

	return {
		subscribe,
		add: (order: OrdersByUserId) => {
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
	const { subscribe, set, update } = writable<Map<currencyTypeUnion, NewPaymentsDetails>>(new Map());

	return {
		subscribe,
		add: (amount: NewPaymentsDetails) => {
			const key = amount.currency
			update((paymentStore) => {
				paymentStore.set(key, amount)
				return paymentStore
			})
		},
		remove: (key: currencyTypeUnion) => {
			update((paymentStore) => {
				paymentStore.delete(key)
				return paymentStore
			})
		},
		reset: () => set(new Map())
	};
}

export const amountTenderedStore = amountTendered();

function customer() {
	const { subscribe, set, update } = writable<Contacts| undefined>(undefined);

	return {
		subscribe,
		add: (contact: Contacts | undefined) => {
			update(() => contact)
		},
		reset: () => set(undefined)
	};
}

export const customerStore = customer();

export const selectedOrdersPaymentTotals = derived([selectedOrdersPaymentStore, amountTenderedStore, customerStore], ([$selectedOrdersPaymentStore, $amountTenderedStore, $customerStore]) => {
	const totalArray = ['0'] as unknown as currency[]
	const ordersTotalsArray = [...$selectedOrdersPaymentStore.values()].map((item) => item.sales_amount) as unknown as currency[]
	const selectedOrdersTotal = addMany([...totalArray, ...ordersTotalsArray])
	console.log("🚀 ~ file: paymentsStore.ts:80 ~ selectedOrdersPaymentTotals ~ selectedOrdersTotal:", selectedOrdersTotal)
	const amountTendered = [...$amountTenderedStore.values()].reduce((accumulator, currentValue) => { return currency(accumulator).add(currentValue.default_currency_equivalent).toString()}, '0')
	console.log("🚀 ~ file: paymentsStore.ts:81 ~ selectedOrdersPaymentTotals ~ amountTendered:", amountTendered)
	const customerDeposit = +($customerStore?.amount || '0') > 0 ? ($customerStore?.amount || '0') : '0'
	console.log("🚀 ~ file: paymentsStore.ts:82 ~ selectedOrdersPaymentTotals ~ customerDeposit:", customerDeposit)
	const customerTotalTendered = addMany([customerDeposit, amountTendered.toString()])
	const totalDue = subtractMany([ customerTotalTendered, selectedOrdersTotal,  ])
	const totalProducts = [...$selectedOrdersPaymentStore.values()].reduce((accumulator, currentValue) => accumulator + currentValue.total_products, 0)

	return {
		selectedOrdersTotal,
		amountTendered,
		customerDeposit,
		customerTotalTendered,
		totalDue,
		totalProducts
	}
})

function paymentMethodSelected() {
	const { subscribe, set, update } = writable<PaymentMethodUnion>('Cash');

	return {
		subscribe,
		add: (paymentMethod: PaymentMethodUnion | undefined) => {
			if (paymentMethod) {
				if (paymentMethod) {
					update(() => paymentMethod)
				}
			}
		},
		reset: () => set('Cash')
	};
}

export const paymentMethodSelectedStore = paymentMethodSelected();

function paymentCurrency() {
	const { subscribe, set, update } = writable<currencyTypeUnion>('USD');

	return {
		subscribe,
		add: (paymentCurrency: currencyTypeUnion) => {
			if (paymentCurrency) {
				if (paymentCurrency) {
					update(() => paymentCurrency)
				}
			}
		},
		reset: () => set('USD')
	};
}

export const paymentCurrencyStore = paymentCurrency();




