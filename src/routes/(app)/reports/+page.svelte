<script lang="ts">
	import { page } from '$app/stores';	
	import { enhance } from '$app/forms';
	import { longPress } from '$lib/utility/inputSelectDirective.js';

	let counter = 0

	const add = () => {
		counter = counter + 1
	}
	const subtract = () => {
		counter = counter - 1
	}
</script>

<svelte:head>
	<title>Reports</title>
</svelte:head>
<h1>Reports</h1>



<button class="btn btn-primary mb-4" on:longPress={() => add()} use:longPress>
	long press me add
</button>

<button class="btn btn-primary mb-4" on:longPress={() => subtract()} use:longPress>
	long press me subtract
</button>

<div>
	counter = <span>{counter}</span>
</div>
