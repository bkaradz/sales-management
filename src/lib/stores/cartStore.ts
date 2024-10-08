import type { Contacts, NewOrdersDetails, Products } from '$lib/server/drizzle/schema/schema';
import { addMany, calcPrice } from '$lib/utility/calculateCart.util';
import type { CalcPriceReturn } from '$lib/utility/calculateCart.util';
import type { ExchangeRateToMap, PricelistToMap } from '$lib/utility/monetary.util';
import type { EmbroideryTypeUnion, GarmentPlacementUnion, PaymentStatusUnion, ProductCategoriesUnion, ProductionStatusUnion, SalesStatusUnion, currencyTypeUnion } from '$lib/utility/lists.utility';
import { get, writable, derived } from 'svelte/store';
import currency from 'currency.js';
import type { GetProducts } from '$lib/server/routes/products/products.drizzle';


export type CartTypes = { product: GetProducts['products'][0], orders_details: Partial<NewOrdersDetails> }

const getOrderDetailObj = (product: GetProducts['products'][0]) => {

	if (product.productCategory === 'Embroidery') {
		return {
			// total_price: '0' as currency | string,
			unitPrice: '0' as currency | string,
			priceCalculated: true,
			quantity: 1,
			productId: product.id,
			productCategory: product.productCategory,
			embroideryType: "Flat" as EmbroideryTypeUnion,
			garmentPlacement: "Front Left" as GarmentPlacementUnion,
			stitches: product.stitches,
			pricelistId: get(pricelistStore).pricelist.id,
		}
	}

	const unitPrice = product.productUnitPrice

	if (!unitPrice) throw new Error("Unit Price not found");

	return {
		// total_price: '0' as currency | string,
		unitPrice: unitPrice as currency | string,
		priceCalculated: false,
		quantity: 1,
		productId: product.id,
		productCategory: product.productCategory,
	}

}

function cart() {
	const { subscribe, set, update } = writable<Map<number, CartTypes>>(new Map());

	return {
		subscribe,
		add: (product: GetProducts['products'][0]) => {
			update((productMap) => {
				if (productMap.has(product.id)) {
					const getProductsOrderDetails = productMap.get(product.id) as CartTypes
					if (getProductsOrderDetails.orders_details.quantity) {
						getProductsOrderDetails.orders_details.quantity += 1
					} else {
						getProductsOrderDetails.orders_details.quantity = 1
					}
					return productMap
				} else {
					const orders_details = getOrderDetailObj(product)

					productMap.set(product.id, { product, orders_details: {...orders_details, unitPrice: orders_details.unitPrice.toString()} })

					return productMap
				}
			})
		},
		addProductsArray: (productArray: Products[] | undefined, order_details: NewOrdersDetails[] | undefined) => {
			const orderDetailsMap = new Map<number, NewOrdersDetails>()
			if (Array.isArray(order_details)) {
				order_details.forEach((item) => {
					const newItem = { ...item, unitPrice: item.unitPrice }
					orderDetailsMap.set(item.productId, newItem)
				})
			}
			if (Array.isArray(productArray)) {
				update((productMap) => {
					productArray.forEach((product) => {
						if (productMap.has(product.id)) {
							const getProductsOrderDetails = productMap.get(product.id) as CartTypes
							if (getProductsOrderDetails.orders_details.quantity) {
								getProductsOrderDetails.orders_details.quantity += 1
							} else {
								getProductsOrderDetails.orders_details.quantity = 1
							}
						} else {
							const orders_details_input = orderDetailsMap.get(product.id)
							productMap.set(product.id, { product, orders_details: { ...orders_details_input } })
						}
					})
					return productMap
				})
			}
		},
		subtract: (product: GetProducts['products'][0]) => {
			update((productMap) => {
				if (productMap.has(product.id)) {
					const getProductsOrderDetails = productMap.get(product.id) as CartTypes
					if (getProductsOrderDetails.orders_details.quantity) {
						getProductsOrderDetails.orders_details.quantity -= 1
						if (getProductsOrderDetails.orders_details.quantity === 0) {
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
		changeEmbType: ({ id, type }: { id: number, type: EmbroideryTypeUnion }) => {
			update((productMap) => {
				const getProductsOrderDetails = productMap.get(id) as CartTypes
				getProductsOrderDetails.orders_details.embroideryType = type
				return productMap
			})
		},
		changeGarmentPosition: ({ id, type }: { id: number, type: GarmentPlacementUnion }) => {
			update((productMap) => {
				const getProductsOrderDetails = productMap.get(id) as CartTypes
				getProductsOrderDetails.orders_details.garmentPlacement = type
				return productMap
			})
		},
		changeUnitPrice: ({ id, unitPrice }: { id: number, unitPrice: string }) => {
			update((productMap) => {
				const getProductsOrderDetails = productMap.get(id) as CartTypes
				getProductsOrderDetails.orders_details.unitPrice = unitPrice.toString()
				getProductsOrderDetails.orders_details.priceCalculated = false
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

function doubleClickSelect() {
	const { subscribe, set, update } = writable<Map<number, boolean>>(new Map());

	return {
		subscribe,
		add: (id: number) => update((doubleClickMap) => doubleClickMap.set(id, true)),
		reset: () => set(new Map())
	};
}

export const doubleClickSelectStore = doubleClickSelect();

function salesStatusSelected() {
	const { subscribe, set, update } = writable<SalesStatusUnion>('Quotation');

	return {
		subscribe,
		add: (orderType: SalesStatusUnion | undefined) => {
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
	const { subscribe, set, update } = writable<PaymentStatusUnion>('Awaiting Sales Order');

	return {
		subscribe,
		add: (paymentStatus: PaymentStatusUnion | undefined) => {
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
	const { subscribe, set, update } = writable<ProductionStatusUnion>('Received');

	return {
		subscribe,
		add: (orderType: ProductionStatusUnion | undefined) => {
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

function selectedCurrency() {
	const { subscribe, set, update } = writable<currencyTypeUnion>('USD');

	return {
		subscribe,
		add: (rate: currencyTypeUnion) => {
			update(() => rate)
		},
	};
}

export const selectedCurrencyStore = selectedCurrency();


export const cartTotalsStore = derived([cartStore, pricelistStore, vatStore], ([$cartStore, $pricelistStore, $vatStore]) => {
	const cartResults = new Map<number, CalcPriceReturn>()

	$cartStore.forEach((value, key) => {
		const results = calcPrice(value, $pricelistStore)
		value.orders_details = { ...value.orders_details, ...results, unitPrice: results.unitPrice.toString() }
		cartResults.set(key, { ...value.orders_details, ...results })
	})

	const totalArray: (currency | string)[] = [...cartResults.values()].map((item) => item.total_price)
	const totalProductsArray: number[] = [...cartResults.values()].map((item) => item.quantity)

	const initValue = 0 as unknown as currency

	totalArray.push(initValue)

	const total = addMany(totalArray)
	const totalProduct = totalProductsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
	const vatTotal = currency(total).multiply($vatStore)

	return {
		sub_total: total,
		totalProduct,
		vat: vatTotal,
		grand_total: addMany([total, vatTotal])
	}

})

function selectedProductCategory() {
	const { subscribe, set, update } = writable<ProductCategoriesUnion>('Embroidery');

	return {
		subscribe,
		add: (productCategory: ProductCategoriesUnion) => {
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
	const { subscribe, set, update } = writable<currency | string >('0');

	return {
		subscribe,
		add: (amount: currency | string) => {
			if (amount) {
				update(() => amount)
			} else {
				update(() => '0')
			}
		},
		addDinero: (unitPrice: currency | string | null | undefined) => {
			if (unitPrice) {
				update(() => unitPrice)
			} else {
				update(() => '0')
			}
		},
		reset: () => set('0')
	};
}

export const enteredAmountStore = enteredAmount();

export const enteredAmountValue = derived([enteredAmountStore, selectedCurrencyStore, exchangeRatesStore], ([$enteredAmountStore, $selectedCurrencyStore, $exchangeRatesStore]) => {

	return $enteredAmountStore

})

