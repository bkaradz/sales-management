<script lang="ts">
	import {
		svgCheckCircle,
		svgExclamation,
		svgInfo,
		svgShieldExclamation,
		svgXSmall
	} from '$lib/assets/svgLogos';
	import { timeout, toasts } from '$lib/stores/toasts.store';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	export let type: string;
	export let message: string;
	export let id: string;

	let progressMotionStapes = 100

	let progress = 0

	function updateTimer() {
    progress = progress + 1/progressMotionStapes
  }

	let interval = setInterval(updateTimer, timeout/progressMotionStapes);
  $: if (progress === 1) clearInterval(interval);

	let icon = `${svgCheckCircle}`;
	let style = 'bg-success';

	if (type === 'error') {
		icon = `${svgShieldExclamation}`;
		style = 'bg-error';
	}
	if (type === 'warning') {
		icon = `${svgExclamation}`;
		style = 'bg-warning';
	}
	if (type === 'info') {
		icon = `${svgInfo}`;
		style = 'bg-info';
	}

	onDestroy(() => {
    clearInterval(interval);
  });

</script>

<!-- Info -->

<div
	transition:fade={{ duration: 2000 }}
	style="--progress: {progress}"
	class="{style} progress relative m-1 flex h-16 w-[700px] items-center justify-between overflow-hidden text-slate-900 rounded-none"
>
	<span class="mx-2 flex-none">
		{@html icon}
	</span>

	<!-- success, warning, error, info -->
	<span class="flex h-12 grow items-center overflow-hidden text-ellipsis">
		<p class="text-sm">{@html message}</p>
	</span>

	<span class="mr-2 flex-none">
		<button on:click={() => toasts.remove(id)}>
			{@html svgXSmall}
		</button>
	</span>
</div>0

<!-- Warning -->
<style lang="postcss">
	.progress::after {
		content: '';
		width: calc(100% * var(--progress, 1));
		@apply absolute bottom-0 h-1 bg-slate-400;
	}
</style>
