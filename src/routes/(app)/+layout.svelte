<script lang="ts">
	import type { LayoutData } from './$types';
	import Aside from '$lib/components/Aside.svelte';
	import { svgDropdown } from '$lib/assets/svgLogos';
	import { menuTabs } from '$lib/data/tabsData';
	import { enhance } from '$app/forms';
	

	export let data: LayoutData;
</script>

<div
	class="bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-600 h-screen flex overflow-hidden text-sm"
>
	<!-- Aside -->
	<Aside/>
	<!-- Header and Main -->
	<div class="flex-grow overflow-hidden h-full flex flex-col">
		<!-- Header -->
		<!-- <Header {data}/> -->
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
				<form class="rounded-sm " action="/logout" method="post">
					<button class="h-8 px-3 rounded-md shadow text-white bg-red-500" type="submit">Log Out</button>
					<!-- <button class="bg-sky-500 btn-block z-50" type="submit">Sign out2</button> -->
				</form>
		
				<div class="dropdown dropdown-bottom dropdown-end">
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label tabindex="0" class="flex items-center">
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
						class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
					>
						<li><button class="rounded-sm">Account</button></li>
						<!-- <li>
							<form class="rounded-sm" action="/register?/logout" use:enhance method="post">
								<button type="submit">Sign out</button>
							</form>
						</li>
						<li >
							<form class="rounded-sm " action="/logout" method="post">
								<button class="bg-sky-500 btn-block z-50" type="submit">Sign out2</button>
							</form>
						</li> -->
					</ul>
				</div>
			</div>
		</div>
		
		<!-- Main -->
		<slot/>
	</div>
</div>