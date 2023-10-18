<script lang="ts">
	import { svgBin, svgDropdown, svgSearch, svgThreeDots } from '$lib/assets/svgLogos';
	import { calcPrice, format } from '$lib/utility/calculateCart.util';
	import { dinero } from 'dinero.js';
	import type { PageData } from './$types';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import {
		cartPricesStore,
		cartStore,
		exchangeRatesStore,
		cartTotalsStore,
		selectedRateStore
	} from '$lib/stores/cartStore';
	import { v4 as uuidv4 } from 'uuid';
	import type { Contacts } from '$lib/server/drizzle/schema';

	export let data: PageData;

	const embType = ['flat', 'cap', 'applique', 'nameTag'];

	let activitiesTabs = [
		{ id: uuidv4(), name: 'Products Details', selected: true },
		{ id: uuidv4(), name: 'Cart Details', selected: false }
	];

	let selectedActivitiesTab = activitiesTabs.find((tab) => (tab.selected = true)) as {
		id: string;
		name: string;
		selected: boolean;
	};

	const changeActivitiesTabsSelection = (selectedTab: {
		id: string;
		name: string;
		selected: boolean;
	}) => {
		if (!selectedActivitiesTab) throw new Error('Id is not defined');

		if (selectedTab.id === selectedActivitiesTab.id) return;

		activitiesTabs.forEach((tab) => {
			if (tab.id === selectedTab.id) {
				tab.selected = true;
			} else {
				tab.selected = false;
			}
		});

		selectedActivitiesTab = selectedTab;

		activitiesTabs = activitiesTabs;
	};

	let customerSelected: Contacts;
</script>

<div class="flex-grow flex overflow-x-hidden">
	<!-- Users Cards -->

	<div
		class="xl:w-72 w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
	>
		<div class="text-xs text-gray-400 tracking-wider">Customer</div>
		<div class="relative mt-2">
			<form data-sveltekit-keepfocus data-sveltekit-replacestate method="get">
				<input
					use:selectTextOnFocus
					type="text"
					name="search"
					class="pl-8 h-8 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm"
					placeholder="Search"
					on:input={debounceSearch}
					on:change={debounceSearch}
				/>
				{@html svgSearch}
			</form>
		</div>
		<div class="space-y-4 mt-3">
			{#if data.results}
				{#each data.results.contacts as user (user.id)}
					<button
						on:click={() => (customerSelected = user)}
						class={`${
							customerSelected?.id === user.id
								? 'shadow-lg relative ring-2 ring-blue-500 focus:outline-none'
								: 'shadow'
						} bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}
					>
						<div
							class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
						>
							{user.full_name}
						</div>
						<div class="flex items-center w-full">
							<div class="text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md">
								<p>Balance</p>
							</div>
							<div class="ml-auto text-xs text-gray-500">
								{format(
									converter(dinero(user.balance_due), $selectedRateStore, $exchangeRatesStore)
								)}
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</div>
	<!-- User Table -->

	<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
		<div
			class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
		>
			<div class="flex w-full items-center">
				<div class="flex items-center text-3xl text-gray-900 dark:text-white">Cart Products</div>
				<div class="ml-auto sm:flex hidden items-center justify-end">
					<div class="text-right">
						<div class="text-xs text-gray-400 dark:text-gray-400">Cart Total:</div>
						<div class="text-gray-900 text-lg dark:text-white">
							{format(
								converter($cartTotalsStore.grand_total, $selectedRateStore, $exchangeRatesStore)
							)}
						</div>
					</div>
				</div>
			</div>
			<div class="flex items-center space-x-3 sm:mt-7 mt-4">
				{#each activitiesTabs as activity, index (activity.id)}
					<button
						on:click={() => changeActivitiesTabsSelection(activity)}
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
		{#if selectedActivitiesTab.name === 'Products Details'}
			<div class="sm:p-7 p-4">
				<table class="table table-sm">
					<thead>
						<tr class="text-gray-400">
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Id</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Name</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Stitches</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Emb Type</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Units</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Unit Price</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Total Price</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Cart</th
							>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-100">
						{#each $cartStore.entries() as [key, product] (product.id)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{product.id}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{product.name}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{product.stitches || 'None'}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="dropdown dropdown-bottom dropdown-end">
										<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
										<!-- svelte-ignore a11y-label-has-associated-control -->
										<label
											tabindex="0"
											class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500"
										>
											<span class="ml-2">{product.embroidery_type}</span>
											{@html svgDropdown}
										</label>
										<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
										<ul
											tabindex="0"
											class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
										>
											{#each embType as type (type)}
												{#if !(type === product.embroidery_type)}
													<li>
														<button
															on:click={() => cartStore.changeEmbType({ id: key, type })}
															class="rounded-sm"
														>
															{type}
														</button>
													</li>
												{/if}
											{/each}
										</ul>
									</div>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{$cartPricesStore.get(key)?.quantity}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										converter(
											$cartPricesStore.get(key)?.unit_price,
											$selectedRateStore,
											$exchangeRatesStore
										)
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										converter(
											$cartPricesStore.get(key)?.total_price,
											$selectedRateStore,
											$exchangeRatesStore
										)
									)}
								</td>

								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<button
											on:click={() => cartStore.subtract(product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500"
										>
											<span>-</span>
										</button>
										<div class="px-3">
											<span>
												{$cartStore.has(product.id) ? $cartStore.get(product.id).quantity : 0}
											</span>
										</div>
										<button
											on:click={() => cartStore.add(product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500"
										>
											<span>+</span>
										</button>
									</div>
								</td>

								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<button on:click={() => cartStore.removeProduct(product.id)}>
											{@html svgBin}
										</button>
									</div>
								</td>
							</tr>
						{/each}
						<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
								<span>Sub Total</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
								{format(
									converter($cartTotalsStore.sub_total, $selectedRateStore, $exchangeRatesStore)
								)}
							</td>

							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />

							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
						</tr>
						<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
								<span>Vat</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
								{format(converter($cartTotalsStore.vat, $selectedRateStore, $exchangeRatesStore))}
							</td>

							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />

							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
						</tr>
						<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
								<span>Total</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
								{format(
									converter($cartTotalsStore.grand_total, $selectedRateStore, $exchangeRatesStore)
								)}
							</td>

							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />

							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
						</tr>
					</tbody>
				</table>
			</div>
		{/if}
		{#if selectedActivitiesTab.name === 'Cart Details'}
		<div class="grid grid-cols-3 gap-4">

			<div class="w-full">
				<div
					class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
				>
					<div class="pl-3 text-xl text-gray-900 dark:text-white">Contact</div>
					{#if customerSelected}
						<div class="space-y-4 mt-3">
							<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
								<div
									class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-1 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									{customerSelected.full_name}
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Id</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.id}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Corporate
									</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.is_corporate}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Active
									</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.active}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Balance
									</div>
									<div class="ml-auto text-xs text-gray-500">
										{format(
											converter(
												dinero(customerSelected.balance_due),
												$selectedRateStore,
												$exchangeRatesStore
											)
										)}
									</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Total Receipts
									</div>
									<div class="ml-auto text-xs text-gray-500">
										{format(
											converter(
												dinero(customerSelected.total_receipts),
												$selectedRateStore,
												$exchangeRatesStore
											)
										)}
									</div>
								</div>
								{#if customerSelected.notes}
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Notes
										</div>
										<div class="ml-auto text-xs text-gray-500">{customerSelected.notes}</div>
									</div>
								{/if}
							</button>
						</div>
					{/if}
				</div>
			</div>
			<div class="w-full">
				<div
					class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
				>
					<div class="pl-3 text-xl text-gray-900 dark:text-white">Pricelist</div>
					{#if customerSelected}
						<div class="space-y-4 mt-3">
							<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
								<div
									class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-1 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									{customerSelected.full_name}
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Id</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.id}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Corporate
									</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.is_corporate}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Active
									</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.active}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Balance
									</div>
									<div class="ml-auto text-xs text-gray-500">
										{format(
											converter(
												dinero(customerSelected.balance_due),
												$selectedRateStore,
												$exchangeRatesStore
											)
										)}
									</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Total Receipts
									</div>
									<div class="ml-auto text-xs text-gray-500">
										{format(
											converter(
												dinero(customerSelected.total_receipts),
												$selectedRateStore,
												$exchangeRatesStore
											)
										)}
									</div>
								</div>
								{#if customerSelected.notes}
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Notes
										</div>
										<div class="ml-auto text-xs text-gray-500">{customerSelected.notes}</div>
									</div>
								{/if}
							</button>
						</div>
					{/if}
				</div>
			</div>
			<div class="w-full">
				<div
					class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
				>
					<div class="pl-3 text-xl text-gray-900 dark:text-white">Exchange Rate</div>
					{#if customerSelected}
						<div class="space-y-4 mt-3">
							<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
								<div
									class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-1 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									{customerSelected.full_name}
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Id</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.id}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Corporate
									</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.is_corporate}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Active
									</div>
									<div class="ml-auto text-xs text-gray-500">{customerSelected.active}</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Balance
									</div>
									<div class="ml-auto text-xs text-gray-500">
										{format(
											converter(
												dinero(customerSelected.balance_due),
												$selectedRateStore,
												$exchangeRatesStore
											)
										)}
									</div>
								</div>
								<div
									class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
								>
									<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
										Total Receipts
									</div>
									<div class="ml-auto text-xs text-gray-500">
										{format(
											converter(
												dinero(customerSelected.total_receipts),
												$selectedRateStore,
												$exchangeRatesStore
											)
										)}
									</div>
								</div>
								{#if customerSelected.notes}
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Notes
										</div>
										<div class="ml-auto text-xs text-gray-500">{customerSelected.notes}</div>
									</div>
								{/if}
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
		{/if}
	</div>
</div>
