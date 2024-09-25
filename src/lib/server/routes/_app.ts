import { z } from 'zod';
import { router } from '../trpc';
import { authentication } from '$lib/server/routes/authentication/authentication';
import { contacts } from '$lib/server/routes/contacts/contacts';
import { products } from '$lib/server/routes/products/products';
import { pricelists } from '$lib/server/routes/pricelist/pricelists';
import { rates } from '$lib/server/routes/exchangeRates/rates';
import { shop_orders } from '$lib/server/routes/orders/orders';
import { production } from '$lib/server/routes/production/production';
import { reports } from '$lib/server/routes/reports/reports';
import { payments } from '$lib/server/routes/payments/payments';
import { dashboard } from '$lib/server/routes/dashboard/dashboard';

export const appRouter = router({
	authentication,
	contacts,
	products,
	pricelists,
	rates,
	shop_orders,
	production,
	reports,
	payments,
	dashboard
});

export type AppRouter = typeof appRouter;
