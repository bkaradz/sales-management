import type { Contacts, Orders } from '$lib/server/drizzle/schema/schema';
import { addMany, dollars, subtractMany } from '$lib/utility/calculateCart.util';
import type { PaymentMethodUnion } from '$lib/utility/lists.utility';
import { dinero, toSnapshot } from 'dinero.js';
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
	const totalArray = [dollars(0)]
	const ordersTotalsArray = [...$selectedOrdersPaymentStore.values()].map((item) => dinero(item.sales_amount))
	const selectedOrdersTotal = addMany([...totalArray, ...ordersTotalsArray])
	const amountTendered = dollars($amountTenderedStore * 1000)
	const customerDeposit = dinero($customerStore?.deposit || toSnapshot(dollars(0)))
	const customerTotalTendered = addMany([customerDeposit, amountTendered])
	const totalDue = subtractMany([selectedOrdersTotal, customerTotalTendered ])
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
	const { subscribe, set, update } = writable<PaymentMethodUnion>('Cash USD');

	return {
		subscribe,
		add: (paymentMethod: PaymentMethodUnion | undefined) => {
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




