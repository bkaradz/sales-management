<script lang="ts">
	import type { LayoutData } from './$types';
	import Aside from '$lib/components/Aside.svelte';
	import Header from '$lib/components/Header.svelte';
	
	export let data: LayoutData;
	
</script>

<div
	class="bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-600 h-screen flex overflow-hidden text-sm"
>
	<!-- Aside -->
	<aside class="print:hidden flex">
		<Aside/>
	</aside>
	<!-- Header and Main -->
	<div class="flex-grow overflow-hidden h-full flex flex-col">
		<!-- Header -->
		<div class="print:hidden">
			<Header {data}/>
		</div>
		<!-- Main -->
		<slot/>
	</div>
</div>