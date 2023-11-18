<script lang="ts">
	import GeneralPage from '$lib/components/print/general/GeneralPage.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
    const heading = 'Daily Sales'
</script>



<div class="flex-grow flex overflow-x-hidden">
    <div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
        <GeneralPage {heading} {data}/>
    </div>
</div>