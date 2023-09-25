<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { svgCompLogo } from '$lib/assets/svgLogos';
	import { anchorTagsList } from '$lib/stores/asideMenuList.store';

	// href={tag.url}
	const changeUrl = (url: string | URL) => goto(url);

</script>

<div
	class="bg-white dark:bg-gray-900 dark:border-gray-800 w-14 flex-shrink-0 border-r border-gray-200 flex-col hidden sm:flex"
>
	<!-- Company Logo -->
	<div class="h-16 text-blue-500 flex items-center justify-center">
		{@html svgCompLogo}
	</div>
	<!-- Menu List -->
	<div class="flex mx-auto flex-grow mt-4 flex-col text-gray-400 space-y-4">
		{#each $anchorTagsList as tag (tag.id)}
			<button
				class={`h-10 w-12 rounded-md flex items-center justify-center ${
					$page.url.pathname === tag.url
						? 'dark:bg-gray-700 dark:text-white bg-blue-100 text-blue-500'
						: 'dark:text-gray-500'
				} tooltip tooltip-right tooltip-info`}
				data-tip={tag.name}
				on:click={(e) => changeUrl(tag.url)}
			>
				{@html tag.icon}
			</button>
		{/each}
	</div>
</div>
