<script lang="ts">
	import { toasts } from "$lib/stores/toasts.store";

  let doubleClicked = false
	
</script>

<button class="btn bg-success ml-11 mb-3 w-64 border-none"
  on:click={() =>	toasts.add({
    message: 'Toast Success',
    type: 'success'
  })}
>
  Toast Success
</button>
<button class="btn bg-error ml-11 mb-3 w-64 border-none"
on:click={() =>	toasts.add({
  message: 'Toast Error',
  type: 'error'
})}
>
  Toast Error
</button>
<button class="btn bg-info ml-11 mb-3 w-64 border-none"
on:click={() =>	toasts.add({
  message: 'Toast Info',
  type: 'info'
})}
>
  Toast Info
</button>
<button class="btn bg-warning ml-11 mb-3 w-64 border-none"
on:click={() =>	toasts.add({
  message: 'Toast Warning',
  type: 'warning'
})}
>
  Toast Warning
</button>


