<script lang="ts">
	import ProductionReport from '$lib/components/print/general/ProductionReport.svelte';
    import { splitPage } from '$lib/utility/splitPages.util';
    import type { PageData } from './$types';

    export let data: PageData;
    const heading = 'Daily Production';
    
</script>

<div class="flex-grow flex overflow-x-hidden">
	<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
		{#each splitPage(data?.results?.orders, 10) as dataResults}
			<ProductionReport {heading} {dataResults} />
		{/each}
	</div>
</div>
