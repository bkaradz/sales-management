<script lang="ts">
	import { svgBin, svgDropdown, svgSearch } from '$lib/assets/svgLogos';
	import {
		calcPrice,
		dollars,
		format,
		type EmbTypekey,
		type GarmentPlacement,
		type SalesStatus
	} from '$lib/utility/calculateCart.util';
	import { dinero, toSnapshot } from 'dinero.js';
	import type { ActionData, PageData } from './$types';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import {
		cartPricesStore,
		cartStore,
		exchangeRatesStore,
		cartTotalsStore,
		selectedRateStore,
		pricelistStore,
		customerSelectedStore,
		salesStatusSelectedStore,
		doubleClickSelectStore
	} from '$lib/stores/cartStore';
	import { v4 as uuidv4 } from 'uuid';
	import { DateInput } from 'date-picker-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';

	export let data: PageData;
	export let form: ActionData;

	$: if (form?.success) {
		invalidateAll();
		cartStore.reset();
		customerSelectedStore.reset();
		toasts.add({
			message: 'Order successfully added',
			type: 'success'
		});
	} else {
		// TODO: highlight were errors occurred
	}

	export const SalesStatusKey: SalesStatus[] = ['Quotation', 'Sales Order', 'Invoice', 'Receipt'];

	const embType: EmbTypekey[] = ['Flat', 'Cap', 'Applique', 'Name Tag'];
	const garmentPlacement: GarmentPlacement[] = [
		'Front Left',
		'Front Right',
		'Upper Back',
		'Lower Back',
		'Right Sleeve',
		'Left Sleeve',
		'Cap Front',
		'Cap Right Side',
		'Cap Left Side',
		'Name Tag',
		'Marked Position'
	];

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

	const days = 7;

	let deliveryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

	const changeEnteredAmountStore = (e: Event, id: number) => {
		const target = e.target as HTMLInputElement;
		cartStore.changeUnitPrice({ id, unitPrice: +target.value });
	};
</script>

<div class="flex-grow flex overflow-x-hidden">
	<!-- Users Cards -->

	<div
		class="xl:w-72 w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
	>
		<div class="text-xs text-gray-400 tracking-wider">Customer</div>
		<div class="mt-2 relative">
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
			{#if data.results?.contacts}
				{#each data.results.contacts as user (user.id)}
					<button
						on:click={() => customerSelectedStore.add(user)}
						class={`${
							$customerSelectedStore?.id === user.id
								? 'shadow-lg ring-2 ring-blue-500 focus:outline-none'
								: 'shadow'
						} bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}
					>
						<div
							class="flex xl:flex-row flex-col justify-between items-center font-medium text-gray-900 dark:text-white pb-2 mb-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
						>
							{user.full_name}
							<span class="text-xs py-1 px-2 leading-none dark:bg-blue-500 rounded-md ml-3">
								{user.id}
							</span>
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
			class="z-10 sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
		>
			<div class="flex w-full items-center">
				<div class="flex items-center text-3xl text-gray-900 dark:text-white">Cart Products</div>

				<div class="ml-auto sm:flex hidden items-center justify-end">
					<div class="dropdown dropdown-bottom dropdown-end mr-8">
						<button
							tabindex="0"
							class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 w-full justify-between"
						>
							<span class="ml-2">{$salesStatusSelectedStore}</span>
							{@html svgDropdown}
						</button>
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<ul
							tabindex="0"
							class="dropdown-content menu z-[1] p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
						>
							{#each SalesStatusKey as type (type)}
								{#if !(type === $salesStatusSelectedStore)}
									<li>
										<button on:click={() => salesStatusSelectedStore.add(type)} class="rounded-sm">
											{type}
										</button>
									</li>
								{/if}
							{/each}
						</ul>
					</div>

					<form action="?/submit" method="post" use:enhance>
						<input hidden name="customer_id" type="number" value={$customerSelectedStore?.id} />
						<input hidden name="pricelist_id" type="number" value={$pricelistStore.pricelist.id} />
						<input
							hidden
							name="exchange_rates_id"
							type="number"
							value={$exchangeRatesStore.exchange_rates.id}
						/>
						<input hidden name="sales_status" type="text" value={$salesStatusSelectedStore} />
						<input
							hidden
							name="sales_amount"
							type="text"
							value={JSON.stringify($cartTotalsStore.sub_total)}
						/>
						<input hidden name="total_products" type="text" value={$cartTotalsStore.totalProduct} />
						<input hidden name="description" type="text" value={$customerSelectedStore?.notes} />
						<input hidden name="delivery_date" type="text" value={deliveryDate.toString()} />
						<input
							hidden
							name="orders_details"
							type="text"
							value={JSON.stringify([...$cartPricesStore.values()])}
						/>
						{#if !($cartStore.size === 0) && $customerSelectedStore}
							<button type="submit" class="h-8 px-3 rounded-md shadow text-white bg-blue-500 mr-8">
								Submit
							</button>
						{/if}
					</form>
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
				<table class="table table-sm static">
					<thead>
						<tr class="text-gray-400">
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Name
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Stitches
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Garment Placement
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Emb Type
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Units
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Unit Price
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Total Price
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Cart
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Actions
							</th>
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
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{product.stitches || 'None'}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
								>
									{#if product.product_category.toLowerCase() === 'Embroidery'.toLocaleLowerCase()}
										<div class="dropdown dropdown-bottom dropdown-end">
											<button
												tabindex="0"
												class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500 w-full justify-between"
											>
												<span class="ml-2">{product.garment_placement}</span>
												{@html svgDropdown}
											</button>
											<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-[1] p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
											>
												{#each garmentPlacement as type (type)}
													{#if !(type === product.garment_placement)}
														<li>
															<button
																on:click={() => cartStore.changeGarmentPosition({ id: key, type })}
																class="rounded-sm"
															>
																{type}
															</button>
														</li>
													{/if}
												{/each}
											</ul>
										</div>
									{/if}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
								>
									{#if product.product_category.toLowerCase() === 'Embroidery'.toLocaleLowerCase()}
										<div class="dropdown dropdown-bottom dropdown-end">
											<button
												tabindex="0"
												class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500 w-full justify-between"
											>
												<span class="ml-2">{product.embroidery_type}</span>
												{@html svgDropdown}
											</button>
											<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-[1] p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
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
									{/if}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{$cartPricesStore.get(key)?.quantity}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{#if $doubleClickSelectStore.has(product.id)}
										<input
											class="block min-h-[auto] text-sm rounded border-0 bg-transparent px-3 py-1 outline outline-blue-700 outline-1 m-0"
											type="number"
											min="1"
											step=".01"
											name="unit_price_input"
											id="unit_price_input"
											use:selectTextOnFocus
											on:blur={() => doubleClickSelectStore.reset()}
											on:change|preventDefault={(e) => changeEnteredAmountStore(e, product.id)}
											on:input|preventDefault={(e) => changeEnteredAmountStore(e, product.id)}
										/>
									{:else}
										<input
											disabled
											on:dblclick={() => doubleClickSelectStore.add(product.id)}
											class="block min-h-[auto] text-sm rounded border-0 bg-transparent px-3 py-1 outline-none m-0"
											type="text"
											name="unit_price_label"
											id="unit_price_label"
											value={format(
												converter(
													$cartPricesStore.get(key)?.unit_price,
													$selectedRateStore,
													$exchangeRatesStore
												)
											)}
										/>
									{/if}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{format(
										converter(
											$cartPricesStore.get(key)?.total_price,
											$selectedRateStore,
											$exchangeRatesStore
										)
									)}
								</td>

								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									<div class="flex items-center">
										<button
											on:click={() => cartStore.subtract(product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500"
										>
											<span>-</span>
										</button>
										<div class="px-3">
											<span>
												{$cartStore.has(product.id) ? $cartStore.get(product.id)?.quantity : 0}
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

								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
								>
									<div class="flex items-center">
										<button on:click={() => cartStore.removeProduct(product.id)}>
											{@html svgBin}
										</button>
									</div>
								</td>
							</tr>
						{/each}
						<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
							{#each [1, 2, 3, 4, 5, 6] as item (item)}
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							{/each}
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								<span>Sub Total</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								{format(
									converter($cartTotalsStore.sub_total, $selectedRateStore, $exchangeRatesStore)
								)}
							</td>
							{#each [1, 2] as item (item)}
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							{/each}
						</tr>
						<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
							{#each [1, 2, 3, 4, 5, 6] as item (item)}
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							{/each}
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								<span>Vat</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								{format(converter($cartTotalsStore.vat, $selectedRateStore, $exchangeRatesStore))}
							</td>
							{#each [1, 2] as item (item)}
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							{/each}
						</tr>
						<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
							{#each [1, 2, 3, 4, 5, 6] as item (item)}
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							{/each}
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								<span>Total</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								{format(
									converter($cartTotalsStore.grand_total, $selectedRateStore, $exchangeRatesStore)
								)}
							</td>
							{#each [1, 2] as item (item)}
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800" />
							{/each}
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
						{#if $customerSelectedStore}
							<div class="space-y-4 mt-3">
								<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
									<div
										class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-1 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										{$customerSelectedStore.full_name}
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Id
										</div>
										<div class="ml-auto text-xs text-gray-500">{$customerSelectedStore.id}</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Corporate
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$customerSelectedStore.is_corporate}
										</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Active
										</div>
										<div class="ml-auto text-xs text-gray-500">{$customerSelectedStore.active}</div>
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
													dinero($customerSelectedStore.balance_due),
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
													dinero($customerSelectedStore.total_receipts),
													$selectedRateStore,
													$exchangeRatesStore
												)
											)}
										</div>
									</div>
									{#if $customerSelectedStore.notes}
										<div class="">
											<!-- <div
											class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
										>
											<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
												Notes
											</div>
											<div class="ml-auto text-xs text-gray-500">
												{$customerSelectedStore.notes}
											</div>
										</div> -->
											<textarea
												class="peer block w-full rounded border-0 bg-transparent placeholder-transparent"
												id="notes"
												rows="4"
												name="notes"
												placeholder="Notes"
												value={$customerSelectedStore.notes}
											/>
											<label
												for="notes"
												class="pointer-events-none text-neutral-500 dark:text-neutral-200"
											>
												Notes
											</label>
										</div>
									{/if}
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											<DateInput bind:value={deliveryDate} format="dd-MM-yyyy HH:mm:ss" class="" />
										</div>
										<div class="ml-auto text-xs text-gray-500">Delivery Date</div>
									</div>
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class="w-full mb-4 relative">
											<textarea
												class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
												id="notes"
												rows="4"
												name="notes"
												placeholder="Notes"
											/>
											<label
												for="notes"
												class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
											>
												Notes
											</label>
										</div>
									</div>
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
						{#if data.pricelistAll}
							<div class="space-y-4 mt-3">
								<div class="dropdown dropdown-bottom w-full">
									<button
										tabindex="0"
										class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 w-full justify-between"
									>
										<span class="ml-2">{$pricelistStore.pricelist.id}</span>
										{@html svgDropdown}
									</button>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu z-[1] p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
									>
										{#each data.pricelistAll as pricelist (pricelist.pricelist.id)}
											{#if !($pricelistStore.pricelist.id === pricelist.pricelist.id)}
												<li>
													<button on:click={() => pricelistStore.add(pricelist)} class="rounded-sm">
														{pricelist.pricelist.name}
													</button>
												</li>
											{/if}
										{/each}
									</ul>
								</div>
								<!--  -->
								<button class="bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800">
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Id
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$pricelistStore.pricelist.id}
										</div>
									</div>

									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											default
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$pricelistStore.pricelist.default}
										</div>
									</div>

									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											date created
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$pricelistStore.pricelist.created_at}
										</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											name
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$pricelistStore.pricelist.name}
										</div>
									</div>
									{#each $pricelistStore.pricelist_details as [key, value] (key)}
										<p
											class="py-2 mt-0.5 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
										>
											{key}
										</p>
										{#each value as list (list.id)}
											<div
												class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
											>
												<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
													{list.minimum_quantity}
												</div>
												<div class="ml-auto text-xs text-gray-500">
													{format(
														converter(
															calcPrice(
																{
																	id: 19,
																	user_id: 'ivk4l3dy6enbyjb',
																	name: 'ADMIRABLE.EMB',
																	description: null,
																	product_category: 'Embroidery',
																	unit_price: null,
																	stitches: 1537,
																	quantity: null,
																	embroidery_type: 'Flat',
																	garment_placement: 'Front Left',
																	active: true,
																	created_at: new Date(),
																	updated_at: new Date()
																},
																$pricelistStore,
																list.minimum_quantity,
																key
															).unit_price,
															$selectedRateStore,
															$exchangeRatesStore
														)
													)}
												</div>
											</div>
										{/each}
									{/each}
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
						{#if data.exchangeRateAll}
							<div class="space-y-4 mt-3">
								<div class="dropdown dropdown-bottom w-full">
									<button
										tabindex="0"
										class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 w-full justify-between"
									>
										<span class="ml-2">{$exchangeRatesStore.exchange_rates.id}</span>
										{@html svgDropdown}
									</button>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu z-[1] p-2 shadow bg-base-100 rounded-sm w-52 mt-4"
									>
										{#each data.exchangeRateAll as exchange (exchange.exchange_rates.id)}
											{#if !($exchangeRatesStore.exchange_rates.id === exchange.exchange_rates.id)}
												<li>
													<button
														on:click={() => exchangeRatesStore.add(exchange)}
														class="rounded-sm"
													>
														{exchange.exchange_rates.id}
													</button>
												</li>
											{/if}
										{/each}
									</ul>
								</div>
								<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Id
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$exchangeRatesStore.exchange_rates.id}
										</div>
									</div>

									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											default
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$exchangeRatesStore.exchange_rates.default}
										</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											date created
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$exchangeRatesStore.exchange_rates.created_at}
										</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white mt-0.5 xl:border-t border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									/>
									{#each $exchangeRatesStore.exchange_rate_details as [key, value] (key)}
										<div
											class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
										>
											<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
												{value.name}
												<span class="ml-0.5">({value.currency})</span>
											</div>
											<div class="ml-auto text-xs text-gray-500">
												{format(converter(dollars(1 * 1000), value.currency, $exchangeRatesStore))}
											</div>
										</div>
									{/each}
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
