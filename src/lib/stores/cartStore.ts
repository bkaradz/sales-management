import type { Contacts, OrdersDetails, Products } from '$lib/server/drizzle/schema';
import { addMany, calcPrice, dollars, format } from '$lib/utility/calculateCart.util';
import type { CalcPriceReturn, EmbTypekey, GarmentPlacement, SalesStatus, ProductCategories, ProductionStatus, PaymentStatus } from '$lib/utility/calculateCart.util';
import { converter } from '$lib/utility/currencyConvertor.util';
import type { ExchangeRateToMap, PricelistToMap } from '$lib/utility/monetary.util';
import { multiply, type Dinero, toSnapshot } from 'dinero.js';
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
					product.garment_placement = 'Front Left'
					product.embroidery_type = 'Flat'
					productMap.set(product.id, product)
					return productMap
				}
			})
		},
		addProductsArray: (productArray: Products[] | undefined, order_details: OrdersDetails[] | undefined) => {
			const orderDetailsMap = new Map<number, OrdersDetails>()
			if (order_details) {
				order_details.forEach((item) => orderDetailsMap.set(item.product_id, item))
			}
			if (productArray) {
				update((productMap) => {
					productArray.forEach((product) => {
						if (productMap.has(product.id)) {
							const productGet = productMap.get(product.id) as Products
							if (productGet.quantity) {
								productGet.quantity = productGet.quantity + 1
							} else {
								productGet.quantity = 1
							}
						} else {
							const quantity = orderDetailsMap.get(product.id)?.quantity
							product.quantity = quantity || 1
							const embroidery_type = orderDetailsMap.get(product.id)?.embroidery_type
							product.embroidery_type = embroidery_type || 'Flat'
							const garment_placement = orderDetailsMap.get(product.id)?.garment_placement
							product.garment_placement = garment_placement || 'Front Left'
							productMap.set(product.id, product)
						}
					})
					return productMap
				})
			}
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
		changeEmbType: ({ id, type }: { id: number, type: EmbTypekey }) => {
			update((productMap) => {
				const productGet = productMap.get(id) as Products
				productGet.embroidery_type = type
				return productMap
			})
		},
		changeGarmentPosition: ({ id, type }: { id: number, type: GarmentPlacement }) => {
			update((productMap) => {
				const productGet = productMap.get(id) as Products
				productGet.garment_placement = type
				return productMap
			})
		},
		changeUnitPrice: ({ id, unitPrice }: { id: number, unitPrice: number }) => {
			update((productMap) => {
				const productGet = productMap.get(id) as Products
				productGet.unit_price = toSnapshot(dollars(unitPrice * 1000))
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
		add: (customer: Contacts | undefined) => {
			if (customer) {
				update(() => customer)
			}
		},
		reset: () => set(null)
	};
}

export const customerSelectedStore = customerSelected();

function salesStatusSelected() {
	const { subscribe, set, update } = writable<SalesStatus>('Quotation');

	return {
		subscribe,
		add: (orderType: SalesStatus | undefined) => {
			if (orderType) {
				if (orderType) {
					update(() => orderType)
				}
			}
		},
		reset: () => set('Quotation')
	};
}

export const salesStatusSelectedStore = salesStatusSelected();

function paymentStatusSelected() {
	const { subscribe, set, update } = writable<PaymentStatus>('Awaiting Sales Order');

	return {
		subscribe,
		add: (paymentStatus: PaymentStatus | undefined) => {
			if (paymentStatus) {
				if (paymentStatus) {
					update(() => paymentStatus)
				}
			}
		},
		reset: () => set('Awaiting Sales Order')
	};
}

export const paymentStatusSelectedStore = paymentStatusSelected();

function productionStatusSelected() {
	const { subscribe, set, update } = writable<ProductionStatus>('Received');

	return {
		subscribe,
		add: (orderType: ProductionStatus | undefined) => {
			if (orderType) {
				if (orderType) {
					update(() => orderType)
				}
			}
		},
		reset: () => set('Received')
	};
}

export const productionStatusSelectedStore = productionStatusSelected();

function pricelist() {
	const { subscribe, set, update } = writable<PricelistToMap>();

	return {
		subscribe,
		add: (pricelist: PricelistToMap | undefined) => {
			if (!pricelist) return
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
	const { subscribe, set, update } = writable<ExchangeRateToMap>();

	return {
		subscribe,
		add: (exchangeRates: ExchangeRateToMap | undefined) => {
			if (!exchangeRates) return
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


export const cartPricesStore = derived([cartStore, pricelistStore], ([$cartStore, $pricelistStore]) => {
	const cartResults = new Map<number, CalcPriceReturn>()

	$cartStore.forEach((value, key) => {
		const results = calcPrice(value, $pricelistStore, value.quantity || 0, value.embroidery_type as EmbTypekey)
		cartResults.set(value.id, results)
	})

	return cartResults
})

export const cartTotalsStore = derived([cartPricesStore, vatStore], ([$cartPricesStore, $vatStore]) => {

	let totalArray: Dinero<number>[] = [dollars(0)]
	let totalProductsArray: number[] = []

	$cartPricesStore.forEach((value, key) => {
		totalArray.push(value.total_price)
		totalProductsArray.push(value.quantity)
	})

	const total = addMany(totalArray)
	const totalProduct = totalProductsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
	const vatTotal = multiply(total, { amount: ($vatStore * 1000), scale: 3 })

	return {
		sub_total: total,
		totalProduct,
		vat: vatTotal,
		grand_total: addMany([total, vatTotal])
	}

})

function selectedProductCategory() {
	const { subscribe, set, update } = writable<ProductCategories>('Embroidery');

	return {
		subscribe,
		add: (productCategory: ProductCategories) => {
			if (productCategory) {
				if (productCategory) {
					update(() => productCategory)
				}
			}
		},
		reset: () => set('Embroidery')
	};
}

export const selectedProductCategoryStore = selectedProductCategory();

function enteredAmount() {
	const { subscribe, set, update } = writable<number>(0);

	return {
		subscribe,
		add: (amount: number) => {
			if (amount) {
				if (amount) {
					update(() => amount)
				}
			} else {
				update(() => 0)
			}
		},
		reset: () => set(0)
	};
}

export const enteredAmountStore = enteredAmount();

export const enteredAmountValue = derived([enteredAmountStore, selectedRateStore, exchangeRatesStore], ([$enteredAmountStore, $selectedRateStore, $exchangeRatesStore]) => {

	return format(
		converter(
			dollars($enteredAmountStore * 1000),
			$selectedRateStore,
			$exchangeRatesStore
		)
	)

})

