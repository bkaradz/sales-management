<script>
	import { enhance } from "$app/forms";
	import { svgSearch } from "$lib/assets/svgLogos";
	import { selectTextOnFocus } from "$lib/utility/inputSelectDirective";

	let isModalOpen = false
</script>

<!-- <svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/daisyui@2/dist/full.css" rel="stylesheet" type="text/css" />
	<script src="https://cdn.tailwindcss.com"></script>
</svelte:head> -->

<!-- The button to open modal -->
<!-- 🔵 set true on click -->

<form id="myForm" data-sveltekit-keepfocus data-sveltekit-replacestate action="?/submit" method="post" use:enhance>
  <input
    use:selectTextOnFocus
    type="text"
    name="search"
    class="pl-8 h-8 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm"
    placeholder="Search"
  />
  {@html svgSearch}
</form>
<button class="btn modal-button rounded-md" on:click={()=>isModalOpen = true}>Submit</button>

<!-- <button class="btn modal-button rounded-md" on:click={()=>isModalOpen = true}>open modal</button> -->

<!-- Put this part before </body> tag -->
<!-- 🔵 conditional `modal-open` class if true -->
<dialog class="modal" class:modal-open={isModalOpen}>
  <div class="modal-box rounded-md">
    <h3 class="font-bold text-lg">Congratulations random Internet user!</h3>
    <p class="py-4">You've been selected for a chance to get one year of subscription to use Wikipedia for free!</p>
    <div class="modal-action">
			<!-- 🔵 set false on click -->
      <input class="btn"  value="Cancel" on:click={()=>isModalOpen = false}>
      <input form="myForm" value="Save" type="submit" class="btn" on:click={()=>isModalOpen = false}/>
    </div>
  </div>
</dialog>