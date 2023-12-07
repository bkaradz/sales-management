import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { savePaymentSchema } from '$lib/validation/payment.zod';
import type { PaymentMethodUnion } from '$lib/utility/lists.utility';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const orders = async (query: any) => {
        return await router.createCaller(await createContext(event)).orders.getOrdersAwaitingPaymentByUserId({ ...query, id: parseInt(event.params.id, 10) });
    }

    const contact = async () => {
        return await router.createCaller(await createContext(event)).contacts.getById(parseInt(event.params.id, 10));
    };

    return {
        contact: contact(),
        orders: orders(query)
    };
}) satisfies PageServerLoad;

export type transactionInput = {
    amount_tendered: number,
    selected_orders_total: number,
    selected_orders_ids: number[],
    payment_method: PaymentMethodUnion,
    customer_id: number
}

type data = {
    amount_tendered: string,
    selected_orders_total: string,
    selected_orders_ids: string,
    payment_method: string,
    customer_id: string
}

export const actions: Actions = {
    submit: async (event) => {

        const session = await event.locals.auth.validate()

        if (!session) {
            throw redirect(303, "/auth/login")
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data) as unknown as data

        const dataResults: transactionInput = {
            amount_tendered: JSON.parse(formData.amount_tendered),
            selected_orders_total: JSON.parse(formData.selected_orders_total),
            selected_orders_ids: JSON.parse(formData.selected_orders_ids),
            payment_method: formData.payment_method as PaymentMethodUnion,
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

            return await router.createCaller(await createContext(event)).transactions.createTransaction(parsedPayment.data)

        } catch (error) {
            return fail(400, {
				message: 'Could not register user',
				errors: { error }
			})
        }

        
    }
}