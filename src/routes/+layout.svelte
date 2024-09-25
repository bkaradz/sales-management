<script lang="ts">
	import '../app.css';
	import { trpc } from '$lib/trpc';
	import type { LayoutData } from './$types';
	import Toasts from '$lib/components/Toasts.svelte';
	import '../styles/styles.css';
	import { exchangeRatesStore, pricelistStore } from '$lib/stores/cartStore';
	import { QueryClientProvider } from '@tanstack/svelte-query';

	export let data: LayoutData;

	// $: pricelistStore.add(data.pricelists);
	// $: exchangeRatesStore.add(data.exchangeRates);
	$: queryClient = trpc.hydrateFromServer(data.trpc);
</script>

<Toasts />
<QueryClientProvider client={queryClient}>
	<slot />
</QueryClientProvider>

