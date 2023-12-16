import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { exchangeRateToMapObj, pricelistToMapObj } from '$lib/utility/monetary.util';
import type { ExchangeRateToMap, PricelistToMap } from '$lib/utility/monetary.util';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveCartOrderSchema, type SaveOrderDetails } from '$lib/validation/cart.zod';
import { saveContactsSchema } from '$lib/validation/contacts.zod';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import type { Pricelist } from '$lib/server/drizzle/schema/schema';
import type { PricelistsAll } from '$lib/trpc/routes/pricelist/pricelists.drizzle';
import type { ratesAll } from '$lib/trpc/routes/exchangeRates/rates.drizzle';

export const load = (async (event) => {

    let query = {}

    const limit = 6
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }


    const pricelist = (pricelistArray: PricelistsAll | undefined) => {

        if (!pricelistArray) throw new Error("Pricelists not found");

        const pricelistMap: PricelistToMap[] = []

        pricelistArray.forEach((pricelist) => pricelistMap.push(pricelistToMapObj(pricelist)))

        return pricelistMap
    };

    const exchangeRate = (exchangeRateArray: ratesAll | undefined) => {

        if (!exchangeRateArray) throw new Error("Exchange Rate not found");

        const eRateMap: ExchangeRateToMap[] = []

        exchangeRateArray.forEach((eRate) => {
            eRateMap.push(exchangeRateToMapObj(eRate))
        })

        return eRateMap
    };

    const [contactsPromise, pricelistPromise, exchangeRatePromise] = await Promise.all([
        await router.createCaller(await createContext(event)).contacts.getContacts(query),
        await router.createCaller(await createContext(event)).pricelists.getAllPricelists(),
        await router.createCaller(await createContext(event)).rates.getAllRates()
    ]);

    return {
        results: contactsPromise,
        pricelistAll: pricelist(pricelistPromise),
        exchangeRateAll: exchangeRate(exchangeRatePromise)
    };
}) satisfies PageServerLoad;

type dataType = {
    customer_id: string;
    pricelist_id: string;
    exchange_rates_id: string;
    description?: string;
    delivery_date: string;
    orders_details: string
    sales_status: string
    sales_amount: string
    total_products: string
}

export const actions: Actions = {
    submit: async (event) => {

        const session = await event.locals.auth.validate()

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data) as dataType

        const cartOrderSubmit = {
            order: {
                customer_id: +formData.customer_id,
                pricelist_id: +formData.pricelist_id,
                exchange_rates_id: +formData.exchange_rates_id,
                sales_status: formData.sales_status,
                description: formData.description,
                delivery_date: new Date(formData.delivery_date).toISOString(),
                sales_amount: formData.sales_amount,
                total_products: +formData.total_products
            },
            orders_details: JSON.parse(formData.orders_details)
        };

        if (!cartOrderSubmit.order.description) {
            delete cartOrderSubmit.order.description
        }

        try {

            const parsedCartOrder = saveCartOrderSchema.safeParse(cartOrderSubmit);

            if (!parsedCartOrder.success) {

                const errorMap = zodErrorMessagesMap(parsedCartOrder);

                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            return await router.createCaller(await createContext(event)).shop_orders.createOrder(parsedCartOrder.data)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }
    },
    createContact: async (event) => {

        const session = await event.locals.auth.validate()

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data)

        let formResults = {}

        if (formData?.full_name) formResults = { ...formResults, full_name: formData.full_name }
        if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
        if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
        if (formData?.address) formResults = { ...formResults, address: normalizeAddress(formData.address as string) }
        if (formData?.is_corporate) formResults = { ...formResults, is_corporate: formData.is_corporate === 'on' ? true : false }
        if (formData?.vat_or_bp_number) formResults = { ...formResults, vat_or_bp_number: formData.vat_or_bp_number }

        try {

            const parsedContact = saveContactsSchema.safeParse(formResults);

            if (!parsedContact.success) {

                const errorMap = zodErrorMessagesMap(parsedContact);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            return await router.createCaller(await createContext(event)).contacts.createContact(parsedContact.data)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }
    }
}