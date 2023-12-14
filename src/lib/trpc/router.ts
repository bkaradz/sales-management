
import { authentication } from '$lib/trpc/routes/authentication/authentication';
import { contacts } from '$lib/trpc/routes/contacts/contacts';
import { products } from '$lib/trpc/routes/products/products';
import { pricelists } from '$lib/trpc/routes/pricelist/pricelists';
import { rates } from '$lib/trpc/routes/exchangeRates/rates';
import { shop_orders } from '$lib/trpc/routes/orders/orders';
import { production } from '$lib/trpc/routes/production/production';
import { transactions } from '$lib/trpc/routes/transactions/transactions';
import { reports } from '$lib/trpc/routes/reports/reports';
import { payments } from '$lib/trpc/routes/payments/payments';
import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const router = t.router({
	authentication,
	contacts,
	products,
	pricelists,
	rates,
	shop_orders,
	production,
	transactions,
	reports,
	payments
});

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;