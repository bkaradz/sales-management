import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { savePaymentSchema } from '$lib/validation/payment.zod';
import type { NewPaymentsDetails } from '$lib/server/drizzle/schema/schema';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const [shopOrdersPromise, contactPromise] = await Promise.all([
        await router.createCaller(await createContext(event)).shop_orders.getOrdersAwaitingPaymentByUserId({ ...query, id: parseInt(event.params.id, 10) }),
        await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id, 10)),
    ]);

    if (!shopOrdersPromise) throw new Error("Order not found");

    return {
        contact: contactPromise,
        results: shopOrdersPromise
    };
}) satisfies PageServerLoad;

export type transactionInput = {
    payments: NewPaymentsDetails,
    selected_orders_total: number,
    selected_orders_ids: number[],
    customer_id: number
}

type data = {
    payments: string,
    selected_orders_total: string,
    selected_orders_ids: string,
    customer_id: string
}

export const actions: Actions = {
    submit: async (event) => {

        const session = await event.locals.auth.validate()

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data) as unknown as data

        const dataResults: transactionInput = {
            payments: JSON.parse(formData.payments),
            selected_orders_total: JSON.parse(formData.selected_orders_total),
            selected_orders_ids: JSON.parse(formData.selected_orders_ids),
            customer_id: +formData.customer_id
        }

        try {
            const parsedPayment = savePaymentSchema.safeParse(dataResults);

            if (!parsedPayment.success) {

                const errorMap = zodErrorMessagesMap(parsedPayment);
                return fail(400, {
                    message: 'Validation error',
                    errors: errorMap
                })
            }

            return await router.createCaller(await createContext(event)).payments.makePayment(parsedPayment.data)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }


    }
}