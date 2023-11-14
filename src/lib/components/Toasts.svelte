<script lang="ts">
	import Toast from '$lib/components/Toast.svelte';
	import { toasts } from '$lib/stores/toasts.store';
</script>

{#if $toasts.length}
	<div>
		{#each $toasts as { id, message, type } (id)}
			<Toast {message} {type} {id} />
		{/each}
	</div>
{/if}

<style lang="postcss">
	div {
		@apply fixed top-[70px] right-0 z-[100] m-2 flex flex-col opacity-90;
	}
</style>
