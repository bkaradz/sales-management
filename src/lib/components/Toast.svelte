<script lang="ts">
	import {
		svgCheckCircle,
		svgExclamation,
		svgInfo,
		svgShieldExclamation,
		svgXSmall
	} from '$lib/utility/svgLogos';
	import { fade } from 'svelte/transition';
	export let type: string;
	export let message: string;
	export let id: string;
	export let removeToast: (id: string) => void;

	let progress = 0;
	let autoClose = 5000;
	let visibleSince = new Date().getTime();

	let intervalId: number | undefined = <any>setInterval(() => {
		const timeVisible = new Date().getTime() - visibleSince;
		progress = timeVisible / autoClose;
	}, 10);

	$: if (progress > 1) {
		clearInterval(intervalId);
		intervalId = undefined;
		removeToast(id);
	}

	const handleDelete = () => {
		clearInterval(intervalId);
		intervalId = undefined;
		removeToast(id);
	};

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
</script>

<!-- Info -->

<div
	transition:fade={{ duration: 2000 }}
	style="--progress: {progress}"
	class="{style} progress relative m-1 flex h-16 w-[700px] items-center justify-between overflow-hidden text-white"
>
	<span class="mx-2 flex-none">
		{@html icon}
	</span>

	<!-- success, warning, error, info -->
	<span class="flex h-12 grow items-center overflow-hidden text-ellipsis">
		<p class="text-xs">{@html message}</p>
	</span>

	<span class="mr-2 flex-none">
		<button on:click={handleDelete}>
			{@html svgXSmall}
		</button>
	</span>
</div>

<!-- Warning -->
<style lang="postcss">
	.progress::after {
		content: '';
		width: calc(100% * var(--progress, 1));
		@apply absolute bottom-0 h-1 bg-slate-400;
	}
</style>
