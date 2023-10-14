<script lang="ts">
	import { enhance } from '$app/forms';
	import { pricelistStore, exchangeRatesStore } from '$lib/stores/cartStore';
	import { getPricelist } from '$lib/utility/calculateCart.util.js';
	import { getContext } from 'svelte';
	
	// export let form;

</script>

<!-- {#each $pricelist.pricelist_details as price }
	<p>
		{price}
	<span></span>
	</p>
{/each} -->