<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import type { LayoutData } from './$types';
    import Toasts from '$lib/components/Toasts.svelte';
    import '../app.css';
	import { exchangeRatesStore, pricelistStore } from '$lib/stores/cartStore';

    export let data: LayoutData

    $:  pricelistStore.add(data.pricelists)
    $:  exchangeRatesStore.add(data.exchangeRates)

</script>

<Toasts />
<slot/>