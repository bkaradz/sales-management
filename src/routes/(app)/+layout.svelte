<script lang="ts">
	import type { LayoutData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Aside from '$lib/components/Aside.svelte';
	

	export let data: LayoutData;
</script>

<div
	class="bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-600 h-screen flex overflow-hidden text-sm"
>
	<!-- Aside -->
	<Aside/>
	<!-- Header and Main -->
	<div class="flex-grow overflow-hidden h-full flex flex-col">
		<!-- Header -->
		<Header {data}/>
		<!-- Main -->
		<slot/>
	</div>
</div>