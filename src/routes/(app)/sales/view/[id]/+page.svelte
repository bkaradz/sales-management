<script lang="ts">
	import { svgDropdown } from '$lib/assets/svgLogos';
	import { calcProductPrices, format } from '$lib/utility/calculateCart.util';
	import type { PageData } from './$types';
	import { convertFx } from '$lib/utility/currencyConvertor.util';
	import {
		cartStore,
		exchangeRatesStore,
		cartTotalsStore,
		selectedCurrencyStore,
		pricelistStore,
		customerSelectedStore,
		salesStatusSelectedStore
	} from '$lib/stores/cartStore';
	import { v4 as uuidv4 } from 'uuid';
	import { datePicker } from 'svelte-flatpickr-plus';
	import { enhance } from '$app/forms';
	import { embroideryType, garmentPlacement, salesStatus } from '$lib/utility/lists.utility';
	import currency from 'currency.js';

	export let data: PageData;

	$: pricelistStore.add(data.results?.pricelist);
	$: exchangeRatesStore.add(data.results?.exchange_rate);
	$: customerSelectedStore.add(data.results?.customer);
	$: cartStore.addProductsArray(data.results?.products, data.results?.orders_details);
	$: salesStatusSelectedStore.add(data.results?.order.sales_status);

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
	const options = {
		dateFormat: 'Z',
		altFormat: 'd F Y',
		altInput: true
	};
</script>

<svelte:head>
	<title>View Sales</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
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
							disabled
							class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between cursor-not-allowed"
						>
							<span class="ml-2">{$salesStatusSelectedStore}</span>
							{@html svgDropdown}
						</button>
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<ul
							tabindex="0"
							class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
						>
							{#each salesStatus as type (type)}
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
						<input hidden name="description" type="text" value={$customerSelectedStore?.notes} />
						<input hidden name="delivery_date" type="text" value={deliveryDate.toString()} />
						<input
							hidden
							name="orders_details"
							type="text"
							value={JSON.stringify([...$cartStore.values()].map((item) => item.orders_details))}
						/>
						{#if !($cartStore.size === 0) && $customerSelectedStore}
							<button
								disabled
								type="submit"
								class="h-8 px-3 rounded-md shadow text-white bg-blue-500 mr-8 cursor-not-allowed"
							>
								Submit
							</button>
						{/if}
					</form>
					<div class="text-right">
						<div class="text-xs text-gray-400 dark:text-gray-400">Cart Total:</div>
						<div class="text-gray-900 text-lg dark:text-white">
							{format(
								convertFx(
									$cartTotalsStore.grand_total,
									$exchangeRatesStore,
									$selectedCurrencyStore
								),
								$selectedCurrencyStore
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
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-100">
						{#each $cartStore.entries() as [key, productsOrderDetails] (key)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{key}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{productsOrderDetails.product.name}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{productsOrderDetails.product.stitches || 'None'}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
								>
									{#if productsOrderDetails.product.product_category === 'Embroidery'}
										<div class="dropdown dropdown-bottom dropdown-end">
											<button
												tabindex="0"
												disabled
												class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between cursor-not-allowed"
											>
												<span class="ml-2"
													>{productsOrderDetails.orders_details.garment_placement}</span
												>
												{@html svgDropdown}
											</button>
											<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content z-[1] menu p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
											>
												{#each garmentPlacement as type (type)}
													{#if !(type === productsOrderDetails.orders_details.garment_placement)}
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
									{#if productsOrderDetails.product.product_category === 'Embroidery'}
										<div class="dropdown dropdown-bottom dropdown-end">
											<button
												tabindex="0"
												disabled
												class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between cursor-not-allowed"
											>
												<span class="ml-2"
													>{productsOrderDetails.orders_details.embroidery_type}</span
												>
												{@html svgDropdown}
											</button>
											<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content z-[1] menu p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
											>
												{#each embroideryType as type (type)}
													{#if !(type === productsOrderDetails.orders_details.embroidery_type)}
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
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{$cartStore.get(key)?.orders_details.quantity}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{format(
										convertFx(
											$cartStore.get(key)?.orders_details.unit_price,
											$exchangeRatesStore,
											$selectedCurrencyStore
										),
										$selectedCurrencyStore
									)}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{format(
										convertFx(
											currency($cartStore.get(key)?.orders_details.unit_price || '0').multiply(
												$cartStore.get(key)?.orders_details.quantity || '0'
											),
											$exchangeRatesStore,
											$selectedCurrencyStore
										),
										$selectedCurrencyStore
									)}
								</td>

								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									<div class="flex items-center">
										<button
											disabled
											on:click={() => cartStore.subtract(productsOrderDetails.product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500 cursor-not-allowed"
										>
											<span>-</span>
										</button>
										<div class="px-3">
											<span>
												{$cartStore.has(key) ? $cartStore.get(key)?.orders_details.quantity : 0}
											</span>
										</div>
										<button
											disabled
											on:click={() => cartStore.add(productsOrderDetails.product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500 cursor-not-allowed"
										>
											<span>+</span>
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
									convertFx(
										$cartTotalsStore.sub_total,
										$exchangeRatesStore,
										$selectedCurrencyStore
									),
									$selectedCurrencyStore
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
								{format(
									convertFx($cartTotalsStore.vat, $exchangeRatesStore, $selectedCurrencyStore),
									$selectedCurrencyStore
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
								<span>Total</span>
							</td>
							<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right">
								{format(
									convertFx(
										$cartTotalsStore.grand_total,
										$exchangeRatesStore,
										$selectedCurrencyStore
									),
									$selectedCurrencyStore
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
								<button
									class={`bg-white relative p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}
								>
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
												convertFx(
													$customerSelectedStore.orders_totals,
													$exchangeRatesStore,
													$selectedCurrencyStore
												),
												$selectedCurrencyStore
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
												convertFx(
													$customerSelectedStore.total_receipts,
													$exchangeRatesStore,
													$selectedCurrencyStore
												),
												$selectedCurrencyStore
											)}
										</div>
									</div>
									{#if $customerSelectedStore.notes}
										<div
											class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
										>
											<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
												Notes
											</div>
											<div class="ml-auto text-xs text-gray-500">
												{$customerSelectedStore.notes}
											</div>
										</div>
									{/if}
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											Delivery Date
										</div>
										<div class="ml-auto text-xs text-gray-500">
											<input
												name="date"
												disabled
												class="pl-8 h-8 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm"
												use:datePicker={options}
												bind:value={deliveryDate}
												readonly
											/>
										</div>
									</div>
									<div
										class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class="relative w-full mb-4">
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
				<div class="w-full relative">
					<div
						class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
					>
						<div class="pl-3 text-xl text-gray-900 dark:text-white">Pricelist</div>
						{#if data.pricelistAll}
							<div class="space-y-4 mt-3">
								<!--  -->
								<div class="dropdown dropdown-bottom w-full z-50">
									<button
										tabindex="0"
										disabled
										class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between cursor-not-allowed"
									>
										<span class="ml-2">{$pricelistStore.pricelist.id}</span>
										{@html svgDropdown}
									</button>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
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
														convertFx(
															calcProductPrices(
																{
																	id: 19,
																	user_id: 'ivk4l3dy6enbyjb',
																	name: 'ADMIRABLE.EMB',
																	description: null,
																	product_category: 'Embroidery',
																	product_unit_price: null,
																	stitches: 1537,
																	stork_quantity: null,
																	active: true,
																	created_at: new Date(),
																	updated_at: new Date()
																},
																$pricelistStore,
																list.minimum_quantity,
																key
															),
															$exchangeRatesStore,
															$selectedCurrencyStore
														),
														$selectedCurrencyStore
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
				<div class="w-full relative">
					<div
						class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
					>
						<div class="pl-3 text-xl text-gray-900 dark:text-white">Exchange Rate</div>
						{#if data.exchangeRateAll}
							<div class="space-y-4 mt-3">
								<div class="dropdown dropdown-bottom w-full z-50">
									<button
										tabindex="0"
										disabled
										class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between cursor-not-allowed"
									>
										<span class="ml-2">{$exchangeRatesStore.exchange_rates.id}</span>
										{@html svgDropdown}
									</button>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
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
												{format(
													convertFx('1', $exchangeRatesStore, value.currency),
													$selectedCurrencyStore
												)}
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
