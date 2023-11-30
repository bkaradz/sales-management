import type { Contacts, OrdersDetails, Products } from '$lib/server/drizzle/schema';
import { addMany, calcPrice, dollars, format } from '$lib/utility/calculateCart.util';
import type { CalcPriceReturn } from '$lib/utility/calculateCart.util';
import type { ExchangeRateToMap, PricelistToMap } from '$lib/utility/monetary.util';
import type { EmbroideryTypeUnion, GarmentPlacementUnion, PaymentStatusUnion, ProductCategoriesUnion, ProductionStatusUnion, SalesStatusUnion } from '$lib/utility/lists.utility';
import { multiply, dinero } from 'dinero.js';
import type { Dinero, DineroSnapshot, } from 'dinero.js';
import { get, writable, derived } from 'svelte/store';

export type NewOrderDetails = Omit<OrdersDetails, 'total_price' | 'unit_price'> & { total_price: Dinero<number>, unit_price: Dinero<number> }

export type CartTypes = { product: Products, orders_details: Partial<NewOrderDetails> }

const getOrderDetailObj = (product: Products) => {

	if (product.product_category === 'Embroidery') {
		return {
			total_price: dollars(0),
			unit_price: dollars(0),
			price_calculated: true,
			quantity: 1,
			product_id: product.id,
			product_category: product.product_category,
			embroidery_type: "Flat" as EmbroideryTypeUnion,
			garment_placement: "Front Left" as GarmentPlacementUnion,
			stitches: product.stitches,
			pricelist_id: get(pricelistStore).pricelist.id,
		}
	}

	const unit_price = product.product_unit_price

	if(!unit_price) throw new Error("Unit Price not found");

	return {
		total_price: dollars(0),
		unit_price: dinero(unit_price),
		price_calculated: false,
		quantity: 1,
		product_id: product.id,
		product_category: product.product_category,
	}

}

function cart() {
	const { subscribe, set, update } = writable<Map<number, CartTypes>>(new Map());

	return {
		subscribe,
		add: (product: Products) => {
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

					productMap.set(product.id, { product, orders_details })
					return productMap
				}
			})
		},
		addProductsArray: (productArray: Products[] | undefined, order_details: OrdersDetails[] | undefined) => {
			const orderDetailsMap = new Map<number, NewOrderDetails>()
			if (Array.isArray(order_details)) {
				order_details.forEach((item) => {
					const newItem = {...item, total_price: dinero(item.total_price), unit_price: dinero(item.unit_price)}
					orderDetailsMap.set(item.product_id, newItem)
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
		subtract: (product: Products) => {
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
				getProductsOrderDetails.orders_details.embroidery_type = type
				return productMap
			})
		},
		changeGarmentPosition: ({ id, type }: { id: number, type: GarmentPlacementUnion }) => {
			update((productMap) => {
				const getProductsOrderDetails = productMap.get(id) as CartTypes
				getProductsOrderDetails.orders_details.garment_placement = type
				return productMap
			})
		},
		changeUnitPrice: ({ id, unitPrice }: { id: number, unitPrice: number }) => {
			update((productMap) => {
				const getProductsOrderDetails = productMap.get(id) as CartTypes
				getProductsOrderDetails.orders_details.unit_price = dollars(unitPrice * 1000)
				getProductsOrderDetails.orders_details.price_calculated = false
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


export const cartTotalsStore = derived([cartStore, pricelistStore, vatStore], ([$cartStore, $pricelistStore, $vatStore]) => {
	const cartResults = new Map<number, CalcPriceReturn>()

	$cartStore.forEach((value, key) => {
		const results = calcPrice(value, $pricelistStore)
		value.orders_details = {...value.orders_details, ...results}
		cartResults.set(key, {...value.orders_details, ...results})
	})

	const totalArray: Dinero<number>[] = [...cartResults.values()].map((item) => item.total_price)
	const totalProductsArray: number[] = [...cartResults.values()].map((item) => item.quantity)
	
	totalArray.push(dollars(0))
	
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
	const { subscribe, set, update } = writable<number>(0);

	return {
		subscribe,
		add: (amount: number) => {
			if (amount) {
				update(() => amount)
			} else {
				update(() => 0)
			}
		},
		addDinero: (unitPrice: DineroSnapshot<number> | null | undefined) => {
			if (unitPrice) {
				const number = format(dinero(unitPrice)) as string
				update(() => +number.split(" ")[1])
			} else {
				update(() => 0)
			}
		},
		reset: () => set(0)
	};
}

export const enteredAmountStore = enteredAmount();

export const enteredAmountValue = derived([enteredAmountStore, selectedRateStore, exchangeRatesStore], ([$enteredAmountStore, $selectedRateStore, $exchangeRatesStore]) => {

	return dollars($enteredAmountStore * 1000)

})

