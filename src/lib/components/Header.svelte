<script lang="ts">
	import { page } from '$app/stores';
	import { svgDropdown, svgLogOut } from '$lib/assets/svgLogos';
	import { selectedRateStore, exchangeRatesStore } from '$lib/stores/cartStore';
	import { menuTabsList, type TabElement } from '$lib/stores/menuTabsList.store';

	type User = {
		id: string;
		username: string;
		full_name: string;
		active: boolean;
		created_at: Date;
		updated_at: Date;
	};

	export let data: Partial<{ user: User }>;

	const changeTab = (tabElement: TabElement, url: string) => {
		menuTabsList.changeSelected({ url, tabElement });
	};
</script>

<div
	class="h-11 lg:flex w-full border-b border-gray-200 dark:border-gray-800 hidden px-10 flex-shrink-0"
>
	<div class="flex h-full text-gray-600 dark:text-gray-400">
		<div class="tabs tabs-boxed bg-transparent">
			{#each $menuTabsList.get($page.url.pathname) || [] as tab (tab.id)}
				<a
					href={tab.url || '#'}
					class={`btn btn-sm ${tab.hidden ? 'hidden' : ''}
					h-8 px-3 rounded-md shadow text-white bg-blue-500 mr-2
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
				class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 w-full justify-between"
			>
				<span class="ml-2">
					{$exchangeRatesStore.exchange_rate_details.get($selectedRateStore)?.name}
				</span>
				{@html svgDropdown}
			</button>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
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

		<button class="h-8 px-3 rounded-md shadow text-white bg-blue-500">Deposit</button>

		<div class="dropdown dropdown-bottom dropdown-end">
			<button tabindex="0" class="flex items-center">
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
				<span class="ml-2">{data?.user?.full_name}</span>
				{@html svgDropdown}
			</button>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
			>
				<li><button class="rounded-sm">Account</button></li>
			</ul>
		</div>
		<form class="rounded-sm" action="/logout" method="post">
			<button class="" type="submit">
				{@html svgLogOut}
			</button>
		</form>
	</div>
</div>
