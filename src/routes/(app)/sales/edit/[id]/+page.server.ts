import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { exchangeRateToMapObj, pricelistToMapObj } from '$lib/utility/monetary.util';
import type { ExchangeRateToMap, PricelistToMap } from '$lib/utility/monetary.util';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { CalcPriceReturnSnapshot } from '$lib/trpc/routes/orders/orders.drizzle';

export const load = (async (event) => {
    let query = {}

    const limit = 7
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const order = async () => {
        return await router.createCaller(await createContext(event)).orders.getById(parseInt(event.params.id, 10))
    };

    const contacts = async (query: any) => {
        return await router.createCaller(await createContext(event)).contacts.getContacts(query);
    };

    const pricelist = async () => {
        const pricelistArray = await router.createCaller(await createContext(event)).pricelists.getAllPricelists();

        if (!pricelistArray) throw new Error("Pricelists not found");

        const pricelistMap: PricelistToMap[] = []

        pricelistArray.forEach((pricelist) => pricelistMap.push(pricelistToMapObj(pricelist)))

        return pricelistMap
    };

    const exchangeRate = async () => {
        const exchangeRateArray = await router.createCaller(await createContext(event)).rates.getAllRates();

        if (!exchangeRateArray) throw new Error("Exchange Rate not found");

        const eRateMap: ExchangeRateToMap[] = []

        exchangeRateArray.forEach((eRate) => {
            eRateMap.push(exchangeRateToMapObj(eRate))
        })

        return eRateMap
    };

    return {
        results: order(),
        pricelistAll: pricelist(),
        exchangeRateAll: exchangeRate()
    };
}) satisfies PageServerLoad;

type dataType = {
    customer_id: string;
    pricelist_id: string;
    exchange_rates_id: string;
    description: string;
    delivery_date: string;
    orders_details: string
    sales_status: string
}

export const actions: Actions = {
    submit: async (event) => {

        const session = await event.locals.auth.validate()

        if (!session) {
            throw redirect(303, "/auth/login")
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data) as dataType

        const orderSubmitObj = {
            order: {
                customer_id: +formData.customer_id,
                pricelist_id: +formData.pricelist_id,
                exchange_rates_id: +formData.exchange_rates_id,
                sales_status: formData.sales_status,
                description: formData.description,
                delivery_date: new Date(formData.delivery_date)
            },
            orders_details: JSON.parse(formData.orders_details) as CalcPriceReturnSnapshot[]
        };

        return await router.createCaller(await createContext(event)).orders.updateOrder(orderSubmitObj)

    }
}