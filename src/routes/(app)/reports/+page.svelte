<script lang="ts">
	import { page } from '$app/stores';	
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toasts.store';
	import { Buffer } from 'buffer';
	import { longPress } from '$lib/utility/inputSelectDirective.js';

	export let form;

	$: if (form?.success) {
		const json = JSON.parse(form.data);

		const pdfBuffer = Buffer.from(json.pdf, 'base64');

		const file = new Blob([pdfBuffer], { type: 'application/pdf' });

		const fileURL = URL.createObjectURL(file);

		let fileLink = document.createElement('a');
		fileLink.href = fileURL;
		fileLink.setAttribute('target','_blank') 
		// fileLink.download = `${'production'}.pdf`;
		// fileLink.setAttribute('name', 'test.pdf')
		fileLink.click();
	}

	$: if (form?.errors) {
		toasts.add({
			message: `${form.message}`,
			type: 'error'
		});
	}

	let pressed = false;

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

<form id="deleteForm" action="?/printPdf" method="post" use:enhance>
	<input type="hidden" name="pathname" value="/reports/production" />
	<input type="hidden" name="origin" value={$page.url.origin} />
	<button class="btn btn-success">Print</button>
</form>

<button class="btn btn-primary mb-4" on:longPress={() => add()} use:longPress>
	long press me add
</button>

<button class="btn btn-primary mb-4" on:longPress={() => subtract()} use:longPress>
	long press me subtract
</button>

<div>
	counter = <span>{counter}</span>
</div>
