<!--
	"Enhanced search" - demonstrates how to write
	a search input with SvelteKit.

	Features:

	- Plain search input using <form method="GET">
	- The GET form submits to the current route, causing
	  a reload to fetch the queried data
	- When JS is not present, the page submits to itself
	  and then shows results
	- When JS is present, a debouncer is used along with
	  `e.target.form.requestSubmit()` to navigate and invalidate the page, while
	  maintaining focus on the input thanks to `data-sveltekit-keepfocus`
	- data-sveltekit-replacestate doesn't push history state when
	  JS is present
	- page title adapts to found results, for screen readers
	- $navigating is used to show or hide a loading message
		
	{/await}
-->

<script lang="ts">
	import { page, navigating } from '$app/stores'
	import { goto } from '$app/navigation'
	
	export let data;

	function debounce(func, delay) {
		let timeoutId;

		return function (...args) {
			clearTimeout(timeoutId);

			timeoutId = setTimeout(() => {
				func.apply(this, args);
			}, delay);
		};
	}

	const search = e => {
		e.target.form.requestSubmit()
	}

	const debounceSearch = debounce(search, 400)

	$: pluralize = data.flavours.length === 1  ? '' : 's'
	$: pageResults = `- ${data.flavours.length} flavour${pluralize} found`
</script>

<svelte:head>
	<title>Find some flavours {pageResults}</title>
</svelte:head>

<h1>Find some flavours!</h1>

<form data-sveltekit-keepfocus data-sveltekit-replacestate method="GET">
	<label for="search-input"> Find a flavour </label>
	<input autocomplete="off" on:input={debounceSearch} id="search-input" name="search" type="search" />
	<button>Search</button>
	{#if $navigating}
		<div aria-live="polite" style="display: inline-block">Loading...</div>
	{/if}
</form>

<h2>Flavours</h2>
<ul>
	{#each data.flavours as flavour}
		<li>{flavour}</li>
	{:else}
		<li>(none)</li>
	{/each}
</ul>

<style>
	label {
		display: block;
	}
</style>
