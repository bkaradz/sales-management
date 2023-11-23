
import { authentication } from '$lib/trpc/routes/authentication/authentication';
import { contacts } from '$lib/trpc/routes/contacts/contacts';
import { products } from '$lib/trpc/routes/products/products';
import { pricelists } from '$lib/trpc/routes/pricelist/pricelists';
import { rates } from '$lib/trpc/routes/exchangeRates/rates';
import { orders } from '$lib/trpc/routes/orders/orders';
import { transactions } from '$lib/trpc/routes/transactions/transactions';
import { reports } from '$lib/trpc/routes/reports/reports';
import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const router = t.router({
	authentication,
	contacts,
	products,
	pricelists,
	rates,
	orders,
	transactions,
	reports
});

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;