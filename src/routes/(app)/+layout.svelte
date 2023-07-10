<script lang="ts">
	import type { LayoutData } from './$types';
	import Toasts from '$lib/components/Toasts.svelte';

	export let data: LayoutData;
</script>

<div class="grid-container">
	<aside class="aside">
		<h1>Aside</h1>
	</aside>
	<header class="header">
		<h1>Header</h1>
	</header>
	<main class="main">
		<Toasts />
		<slot />
	</main>
</div>

<style lang="postcss">
	.grid-container {
		display: grid;
		grid-template-columns: 70px 1fr;
		grid-template-rows: 50px 1fr;
		grid-template-areas:
			'aside header'
			'aside main';
		height: 100svh;
	}
	.aside {
		grid-area: aside;
		background-color: blue;
	}
	.main {
		grid-area: main;
		background-color: blueviolet;
	}
	.header {
		grid-area: header;
		background-color: crimson;
	}
</style>
