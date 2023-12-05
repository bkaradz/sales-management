<script lang="ts">
	import { page } from '$app/stores';	
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toasts.store';
	import { Buffer } from 'buffer';

	export let form;

	$: if (form?.success) {
		const json = JSON.parse(form.data);

		const pdfBuffer = Buffer.from(json.pdf, 'base64');

		const file = new Blob([pdfBuffer], { type: 'application/pdf' });

		const fileURL = URL.createObjectURL(file);

		let fileLink = document.createElement('a');
		fileLink.href = fileURL;
		fileLink.download = `${'production'}.pdf`;
		fileLink.click();
	}

	$: if (form?.errors) {
		toasts.add({
			message: `${form.message}`,
			type: 'error'
		});
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
