<script lang="ts">
	import { enhance } from '$app/forms';
	import { pricelist } from '$lib/stores/cartStore';
	import { getContext } from 'svelte';
	
	export let form;
	
</script>

<!-- {#each $pricelist.pricelist_details as price }
	<p>
		{price}
	<span></span>
	</p>
{/each} -->