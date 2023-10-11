<script lang="ts">
	import { enhance } from '$app/forms';
	import { pricelist } from '$lib/stores/cartStore';

	export let form;
	
</script>

{#each [...$pricelist] as [key, value] }
	<p>
		{key}
	<span>Quantity: {value.quantity}</span>
	</p>
{/each}