import { exchangeRateToMapObj, pricelistToMapObj } from '$lib/utility/monetary.util';
import type { ExchangeRateToMap, PricelistToMap } from '$lib/utility/monetary.util';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { saveCartOrderSchema, type SaveOrderDetails } from '$lib/validation/cart.zod';
import { saveContactsSchema } from '$lib/validation/contacts.zod';
import { normalizeAddress, normalizeEmail, normalizePhone } from '$lib/utility/normalizePhone.util';
import type { PricelistsAll } from '$lib/server/routes/pricelist/pricelists.drizzle';
import type { ratesAll } from '$lib/server/routes/exchangeRates/rates.drizzle';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';
import { createOrder as shopOrdersCreateOrder } from '$lib/server/routes/orders/orders.drizzle';
import { createContact } from '$lib/server/routes/contacts/contacts.drizzle';

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
        await trpcServer.contacts.getContacts.ssr(query, event),
        await trpcServer.pricelists.getAllPricelists.ssr(event),
        await trpcServer.rates.getAllRates.ssr(event)
    ]);

    return {
        results: contactsPromise,
        pricelistAll: pricelist(pricelistPromise),
        exchangeRateAll: exchangeRate(exchangeRatePromise)
    };
}) satisfies PageServerLoad;

type dataType = {
    customerId: string;
    pricelistId: string;
    exchangeRatesId: string;
    description?: string;
    deliveryDate: string;
    orders_details: string
    salesStatus: string
    salesAmount: string
    totalProducts: string
}

export const actions: Actions = {
    submit: async (event) => {

        const { session } = await lucia.validateSession(event.locals.session?.id || "");

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data) as dataType

        const cartOrderSubmit = {
            order: {
                customerId: +formData.customerId,
                pricelistId: +formData.pricelistId,
                exchangeRatesId: +formData.exchangeRatesId,
                salesStatus: formData.salesStatus,
                description: formData.description,
                deliveryDate: new Date(formData.deliveryDate).toISOString(),
                salesAmount: formData.salesAmount,
                totalProducts: +formData.totalProducts
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

            return await shopOrdersCreateOrder(parsedCartOrder.data, event)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }
    },
    createContact: async (event) => {

        const { session } = await lucia.validateSession(event.locals.session?.id || "");

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data)

        let formResults = {}

        if (formData?.fullName) formResults = { ...formResults, fullName: formData.fullName }
        if (formData?.email) formResults = { ...formResults, email: normalizeEmail(formData.email as string) }
        if (formData?.phone) formResults = { ...formResults, phone: normalizePhone(formData.phone as string) }
        if (formData?.address) formResults = { ...formResults, address: normalizeAddress(formData.address as string) }
        if (formData?.isCorporate) formResults = { ...formResults, isCorporate: formData.isCorporate === 'on' ? true : false }
        if (formData?.vatOrBpNumber) formResults = { ...formResults, vatOrBpNumber: formData.vatOrBpNumber }

        try {

            const parsedContact = saveContactsSchema.safeParse(formResults);

            if (!parsedContact.success) {

                const errorMap = zodErrorMessagesMap(parsedContact);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            return await createContact(parsedContact.data, event)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }
    }
}