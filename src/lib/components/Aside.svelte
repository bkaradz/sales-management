<script lang="ts">
	import { page } from '$app/stores';
	import { svgCompLogo, svgSales } from '$lib/assets/svgLogos';
	import { anchorTagsList } from '$lib/stores/asideMenuList';

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
				<a
					href={tag.url}
					class={`h-10 w-12 rounded-md flex items-center justify-center ${
						$page.url.pathname === tag.url
							? 'dark:bg-gray-700 dark:text-white bg-blue-100 text-blue-500'
							: 'dark:text-gray-500'
					} tooltip tooltip-right tooltip-info`} data-tip={tag.name}
				>
					{@html tag.icon}
				</a>
			{/each}
		</div>
	</div>