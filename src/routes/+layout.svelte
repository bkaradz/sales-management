<script lang="ts">
    import type { LayoutData } from './$types';
    import Toasts from '$lib/components/Toasts.svelte';
    import '../app.css';
	import { exchangeRatesStore, pricelistStore } from '$lib/stores/cartStore';
	import { themeModeSelectedStore } from '$lib/stores/darkMod.store';

    export let data: LayoutData


    $:  pricelistStore.add(data.pricelists)
    $:  exchangeRatesStore.add(data.exchangeRates)

</script>

<div class={$themeModeSelectedStore}>
    <Toasts />
    <slot/>
</div>
