<script lang="ts">
	import { jsPDF } from 'jspdf';

	async function handleClick() {
		const doc = new jsPDF({
			orientation: 'p',
			unit: 'pt',
			format: 'letter',
			putOnlyUsedFonts: true,
			compress: true
		});
		const source = document.getElementById('customers');

		if (!source) throw new Error('Doc Element not found');

		await doc.html(source, {
			width: 580,
			windowWidth: 580,
			margin: 15
		});

		doc.save('a4.pdf');
	}
</script>

<div id="customers" class="flex flex-col w-full h-full space-y-1">
	<div class="flex flex-row bg-blue-200 justify-center">
		<p class="m-1 text-primary text-xl">APPLICANT GENERAL INFORMATION</p>
	</div>
	<div class="flex bg-primary justify-center">
		<p class="text-white">Primary Information</p>
	</div>
</div>
<button class="btn btn-primary" on:click={handleClick}>Click for PDF</button>
