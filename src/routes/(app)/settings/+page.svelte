<script>
	let isModalOpen = false
</script>

<!-- <svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/daisyui@2/dist/full.css" rel="stylesheet" type="text/css" />
	<script src="https://cdn.tailwindcss.com"></script>
</svelte:head> -->

<!-- The button to open modal -->
<!-- 🔵 set true on click -->
<button class="btn modal-button" on:click={()=>isModalOpen = true}>open modal</button>

<!-- Put this part before </body> tag -->
<!-- 🔵 conditional `modal-open` class if true -->
<dialog class="modal" class:modal-open={isModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Congratulations random Interner user!</h3>
    <p class="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p>
    <div class="modal-action">
			<!-- 🔵 set false on click -->
      <button class="btn" on:click={()=>isModalOpen = false}>Yay!</button>
    </div>
  </div>
</dialog>