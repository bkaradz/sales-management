<script lang="ts">
	import SalesReport from '$lib/components/print/general/SalesReport.svelte';
	import { splitPage } from '$lib/utility/splitPages.util';
	import type { PageData } from './$types';

	export let data: PageData;
	const heading = 'Daily Sales';

	
</script>

<div class="flex-grow flex overflow-x-hidden">
	<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
		{#each splitPage(data?.results?.shop_orders, 10) as dataResults}
			<SalesReport {heading} {dataResults} />
		{/each}
	</div>
</div>
