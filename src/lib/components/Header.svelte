<script lang="ts">
	import { page } from '$app/stores';
	import { svgDark, svgDropdown, svgLight, svgLogOut, svgUser } from '$lib/assets/svgLogos';
	import type { User } from '$lib/server/drizzle/schema';
	import { selectedRateStore, exchangeRatesStore } from '$lib/stores/cartStore';
	import { userManuallyChangedTheme } from '$lib/stores/darkMod.store';
	import { menuTabsList, type TabElement } from '$lib/stores/menuTabsList.store';

	
	export let data: Partial<{ user: User }>;

	const changeTab = (tabElement: TabElement, url: string) => {
		menuTabsList.changeSelected({ url, tabElement });
	};

	const changeTheme = (theme: 'dark' | 'light') => {
		userManuallyChangedTheme.add('dark');
		if (theme === 'dark') {
			document.documentElement.classList.remove('light');
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.classList.add('light');
		}
	};

	
</script>

<div
	class="relative z-20 h-11 lg:flex w-full border-b border-gray-200 dark:border-gray-800 hidden px-10 flex-shrink-0"
>
	<div class="flex h-full text-gray-600 dark:text-gray-400">
		<div class="tabs tabs-boxed bg-transparent">
			{#each $menuTabsList.get($page.url.pathname) || [] as tab (tab.id)}
				<a
					href={tab.url || '#'}
					class={`btn btn-sm ${tab.hidden ? 'hidden' : ''}
					h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 mr-2 border-none
					`}
					on:click={() => changeTab(tab, $page.url.pathname)}
				>
					{tab.name}
				</a>
			{/each}
		</div>
	</div>
	<div class="ml-auto flex items-center space-x-4">
		<div class="dropdown dropdown-bottom dropdown-end">
			<button
				tabindex="0"
				class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
			>
				<span class="ml-2">
					{$exchangeRatesStore.exchange_rate_details.get($selectedRateStore)?.name}
				</span>
				{@html svgDropdown}
			</button>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content z-[1] menu p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
			>
				{#each $exchangeRatesStore.exchange_rate_details.entries() as [key, value]}
					{#if !($selectedRateStore === key)}
						<li>
							<button on:click={() => selectedRateStore.add(key)} class="rounded-sm">
								{value.name}
							</button>
						</li>
					{/if}
				{/each}
			</ul>
		</div>

		<button class="h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400"
			>Deposit</button
		>

		<div class="dropdown dropdown-bottom dropdown-end">
			<button tabindex="0" class="flex items-center">
				<span class="relative flex-shrink-0">
					<div class="relative w-7 h-7 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
						{@html svgUser}
					</div>
					<span
						class="absolute right-0 -mb-0.5 bottom-0 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-gray-900"
					/>
				</span>
				<span class="ml-2">{data?.user?.full_name}</span>
				{@html svgDropdown}
			</button>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content z-[1] menu p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
			>
				<li><button class="rounded-sm">Account</button></li>
			</ul>
		</div>
		<form class="rounded-sm" action="/logout" method="post">
			<button class="" type="submit">
				{@html svgLogOut}
			</button>
		</form>

		{#if $userManuallyChangedTheme === 'dark'}
			<button on:click={() => changeTheme('light')}>
				{@html svgLight}
			</button>
		{:else}
			<button on:click={() => changeTheme('dark')}>
				{@html svgDark}
			</button>
		{/if}
	</div>
</div>
