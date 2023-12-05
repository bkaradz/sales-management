<script lang="ts">
	import { activitiesTabs } from '$lib/data/tabsData';
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	<!-- User Table -->
	<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
		<div
			class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
		>
			<div class="flex w-full items-center">
				<div class="flex items-center text-3xl text-gray-900 dark:text-white">
					Dashboard
				</div>
				
			</div>
			<div class="flex items-center space-x-3 sm:mt-7 mt-4">
				{#each activitiesTabs as activity, index (activity.id)}
					<button
						class={`px-3 border-b-2 pb-1.5 ${
							activity.selected
								? 'border-blue-500 text-blue-500 dark:text-white dark:border-white'
								: 'border-transparent text-gray-600 dark:text-gray-400'
						} ${index > 1 ? 'sm:block hidden' : ''}`}
					>
						{activity.name}
					</button>
				{/each}
			</div>
		</div>
		<div class="grid grid-cols-2 w-full">
			<div class="bg-slate-900 w-full min-h-screen ">
				<p>High</p>
			</div>
			<div class="bg-indigo-950 w-full h-full">
				<p>Low</p>
			</div>
			
		</div>
	</div>
</div>
