<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;

    let openModal = false

</script>

<!-- You can open the modal using ID.showModal() method -->
<button class="btn" on:click={() => openModal = true}>open modal</button>
    
<dialog id="my_modal_4" class="modal" class:modal-open={openModal}>
  <form method="dialog" class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">Click the button below to close</p>
    <div class="modal-action">
      <!-- if there is a button, it will close the modal -->
      <button class="btn" on:click={() => openModal = false}>Close</button>
    </div>
  </form>
</dialog>

