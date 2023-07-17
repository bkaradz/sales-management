<script lang="ts">
	import { enhance } from '$app/forms';
	import { svgDropdown } from '$lib/assets/svgLogos';
	import { menuTabs } from '$lib/data/tabsData';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';

	export let data;

	const logout = async () => {
		console.log('Entered logout');
		try {
			console.log("🚀 ~ $page:", $page)
			const test = await trpc().authentication.logoutUser.query();
			console.log("🚀 ~ file: Header.svelte:14 ~ logout ~ test:", test)
		} catch (error) {
			console.log('Error', error);
		}
	};
</script>

<div class="h-16 lg:flex w-full border-b border-gray-200 dark:border-gray-800 hidden px-10">
	<div class="flex h-full text-gray-600 dark:text-gray-400">
		{#each menuTabs as tab (tab.id)}
			<button
				class={`cursor-pointer h-full border-b-2 inline-flex items-center mr-8 ${
					tab.selected
						? 'border-blue-500 text-blue-500 dark:text-white dark:border-white'
						: 'border-transparent'
				} `}
			>
				{tab.name}
			</button>
		{/each}
	</div>
	<div class="ml-auto flex items-center space-x-7">
		<button class="h-8 px-3 rounded-md shadow text-white bg-blue-500">Deposit</button>

		<div class="dropdown dropdown-bottom dropdown-end">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label tabindex="0" class=" flex items-center">
				<span class="relative flex-shrink-0">
					<img
						class="w-7 h-7 rounded-full"
						src="https://images.unsplash.com/photo-1521587765099-8835e7201186?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
						alt="profile"
					/>
					<span
						class="absolute right-0 -mb-0.5 bottom-0 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-gray-900"
					/>
				</span>
				<span class="ml-2">{data.user.name}</span>
				{@html svgDropdown}
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-md w-52 mt-4"
			>
				<li><button class="rounded-sm">Account</button></li>
				<li><button on:click={logout} class="rounded-sm">Logout</button></li>
				<li>
					<button formaction="/logout" type="submit" class="rounded-sm">Log Out</button>
				</li>
			</ul>
		</div>
	</div>
</div>
