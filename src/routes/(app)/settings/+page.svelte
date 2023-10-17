<script lang="ts">
	// import { enhance } from '$app/forms';
	// import { pricelistStore, exchangeRatesStore } from '$lib/stores/cartStore';
	// import { format, getPricelist } from '$lib/utility/calculateCart.util.js';
	// import { getContext } from 'svelte';

	// export let form;
</script>

<div class="flex flex-row border w-24 rounded-md border-gray-400 relative">
	<button
		class="font-semibold border-r hover:bg-red-600 text-white border-gray-400 h-full w-20 flex rounded-l-md focus:outline-none cursor-pointer"
	>
		<span class="m-auto">-</span>
	</button>
	<div
		class="w-24 px-1 text-xs md:text-base flex items-center justify-center cursor-default"
	>
		<span>2</span>
	</div>

	<button
		class="font-semibold border-l hover:bg-blue-600 text-white border-gray-400 h-full w-20 flex rounded-r-md focus:outline-none cursor-pointer"
	>
		<span class="m-auto">+</span>
	</button>
</div>
