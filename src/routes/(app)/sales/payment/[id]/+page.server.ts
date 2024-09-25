

import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
import { savePaymentSchema, type SavePayment } from '$lib/validation/payment.zod';
import type { NewPaymentsDetails } from '$lib/server/drizzle/schema/schema';
import { trpcServer } from '$lib/server/server';
import { lucia } from '$lib/server/lucia/client';
import { makePayment } from '$lib/server/routes/payments/payments.drizzle';

export const load = (async (event) => {

    let query = {}

    const limit = event.url.searchParams.get('limit')
    if (limit) query = { ...query, limit: +limit }

    const page = event.url.searchParams.get('page')
    if (page) query = { ...query, page: +page }

    const search = event.url.searchParams.get('search')
    if (search) query = { ...query, search }

    const [shopOrdersPromise, contactPromise] = await Promise.all([
        await trpcServer.shop_orders.getOrdersAwaitingPaymentByUserId.ssr({ ...query, id: parseInt(event.params.id, 10) }, event),
        await trpcServer.contacts.getById.ssr(parseInt(event.params.id, 10), event),
    ]);

    if (!shopOrdersPromise) throw new Error("Order not found");

    return {
        contact: contactPromise,
        results: shopOrdersPromise
    };
}) satisfies PageServerLoad;



type data = {
    payments_details: string,
    selected_orders_total: string,
    selected_orders_ids: string,
    customerId: string,
    exchangeRateId: string
}

export const actions: Actions = {
    submit: async (event) => {

        const { session } = await lucia.validateSession(event.locals.session?.id || "");

        if (!session) {
            redirect(303, "/auth/login");
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data) as unknown as data

        const dataResults: SavePayment = {
            payments_details: JSON.parse(formData.payments_details),
            selected_orders_total: JSON.parse(formData.selected_orders_total),
            selected_orders_ids: JSON.parse(formData.selected_orders_ids),
            customerId: +formData.customerId,
            exchangeRateId: +formData.exchangeRateId
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

            return await makePayment(parsedPayment.data, event)

        } catch (error) {
            return fail(400, {
                message: 'Could not register user',
                errors: { error }
            })
        }


    }
}