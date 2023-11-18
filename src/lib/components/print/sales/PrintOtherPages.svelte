<script lang="ts">
	import type { GetQuotationOrderPrismaReturn } from '$lib/trpc/routes/orders.prisma';
	import type { Dinero } from 'dinero.js';
	import PartialPage from './PartialPage.svelte';

	type OrderType = GetQuotationOrderPrismaReturn['order'];
	type PageType = OrderType & { showTotals: boolean; page: string };

	export let order: PageType;
	export let subTotal: Dinero<number>;
	export let calculatedVat: Dinero<number>;
	export let calculatedTotal: Dinero<number>;
	export let vat: number;
</script>

<PartialPage {order} {subTotal} {calculatedVat} {calculatedTotal} {vat} />
