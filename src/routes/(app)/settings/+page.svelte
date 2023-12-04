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


<dialog class="modal" class:modal-open={isModalOpen}>
  <div class="modal-box bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800">
    <h3 class="font-bold text-lg">Delete product!</h3>
    <p class="py-4">Are you sure you want to delete the product!!!</p>
    <div class="modal-action">
      <input name="cancel" class="btn rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 border-none"  type="button" value="Cancel" on:click={()=>isModalOpen = false}>
      <input name="submit" class="btn rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 border-none" form="myForm" value="Save" type="submit" on:click={()=>isModalOpen = false}/>
    </div>
  </div>
</dialog>