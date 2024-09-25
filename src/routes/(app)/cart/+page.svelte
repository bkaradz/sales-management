<script lang="ts">
	import { svgBin, svgDropdown, svgSearch } from '$lib/assets/svgLogos';
	import { calcProductPrices, format } from '$lib/utility/calculateCart.util';
	import type { ActionData, PageData } from './$types';
	import { longPress, selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { convertFx } from '$lib/utility/currencyConvertor.util';
	import {
		cartStore,
		exchangeRatesStore,
		cartTotalsStore,
		selectedCurrencyStore,
		pricelistStore,
		customerSelectedStore,
		salesStatusSelectedStore,
		doubleClickSelectStore
	} from '$lib/stores/cartStore';
	import { v4 as uuidv4 } from 'uuid';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import { embroideryType, garmentPlacement, salesStatus } from '$lib/utility/lists.utility';
	import { datePicker } from 'svelte-flatpickr-plus';
	import currency from 'currency.js';

	export let data: PageData;
	export let form: ActionData;

	$: if (form?.success) {
		invalidateAll();
		cartStore.reset();
		customerSelectedStore.reset();
		toasts.add({
			message: 'Order created successfully',
			type: 'success'
		});
	} else {
		if (form?.errors instanceof Map) {
			for (const [key, value] of form.errors.entries()) {
				toasts.add({
					message: `${key.charAt(0).toUpperCase() + key.slice(1)} = ${value}`,
					type: 'error'
				});
			}
		}
	}

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
		cartStore.changeUnitPrice({ id, unitPrice: target.value });
	};
	const options = {
		dateFormat: 'Z',
		altFormat: 'd F Y',
		altInput: true
	};

	let isModalOpen = false;
</script>

<svelte:head>
	<title>Cart</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	<!-- Users Cards -->

	<div
		class="xl:w-72 w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
	>
		<div class="text-base text-gray-400 tracking-wider">Customer</div>
		<button
			type="submit"
			class="h-8 px-3 rounded-md shadow text-white bg-blue-500 my-2 w-full"
			on:click={() => (isModalOpen = true)}
		>
			Add Contact
		</button>
		<div class="mt-2 relative">
			<form data-sveltekit-keepfocus data-sveltekit-replacestate method="get">
				<input
					use:selectTextOnFocus
					type="search"
					name="search"
					id="search"
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
							{user.fullName}
							<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md ml-3">
								{user.id}
							</span>
						</div>
						<div class="flex items-center w-full">
							<div class="text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md">
								<p>Amount</p>
							</div>
							<div
								class="ml-auto text-xs text-gray-500 {+user.amount < 0
									? 'text-red-500'
									: 'text-green-500'}"
							>
								{format(
									convertFx(user.amount, $exchangeRatesStore, $selectedCurrencyStore),
									$selectedCurrencyStore
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
							class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
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
						<input hidden name="customerId" type="number" value={$customerSelectedStore?.id} />
						<input hidden name="pricelistId" type="number" value={$pricelistStore.pricelist.id} />
						<input
							hidden
							name="exchangeRatesId"
							type="number"
							value={$exchangeRatesStore.exchangeRates.id}
						/>
						<input hidden name="salesStatus" type="text" value={$salesStatusSelectedStore} />
						<input
							hidden
							name="salesAmount"
							type="text"
							value={$cartTotalsStore.sub_total}
						/>
						<input hidden name="totalProducts" type="text" value={$cartTotalsStore.totalProduct} />
						<input hidden name="description" type="text" value={$customerSelectedStore?.notes} />
						<input hidden name="deliveryDate" type="text" value={deliveryDate.toString()} />
						<input
							hidden
							name="orders_details"
							type="text"
							value={JSON.stringify([...$cartStore.values()].map((item) => item.orders_details))}
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
							<th
								class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
							>
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
									{#if productsOrderDetails.product.productCategory === 'Embroidery'}
										<div class="dropdown dropdown-bottom dropdown-end">
											<button
												tabindex="0"
												class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
											>
												<span class="ml-2"
													>{productsOrderDetails.orders_details.garmentPlacement}</span
												>
												{@html svgDropdown}
											</button>
											<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
											>
												{#each garmentPlacement as type (type)}
													{#if !(type === productsOrderDetails.orders_details.garmentPlacement)}
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
									{#if productsOrderDetails.product.productCategory === 'Embroidery'}
										<div class="dropdown dropdown-bottom dropdown-end">
											<button
												tabindex="0"
												class="flex items-center h-6 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
											>
												<span class="ml-2"
													>{productsOrderDetails.orders_details.embroideryType}</span
												>
												{@html svgDropdown}
											</button>
											<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
											>
												{#each embroideryType as type (type)}
													{#if !(type === productsOrderDetails.orders_details.embroideryType)}
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
									{$cartStore.get(key)?.orders_details.quantity}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{#if $doubleClickSelectStore.has(key)}
										<input
											class="block min-h-[auto] text-sm rounded border-0 bg-transparent px-3 py-1 outline outline-blue-700 outline-1 m-0 text-right"
											type="number"
											min="1"
											step=".01"
											name="unitPrice_input"
											id="unitPrice_input"
											use:selectTextOnFocus
											on:blur={() => doubleClickSelectStore.reset()}
											on:change|preventDefault={(e) => changeEnteredAmountStore(e, key)}
											on:input|preventDefault={(e) => changeEnteredAmountStore(e, key)}
										/>
									{:else}
										<input
											disabled
											on:dblclick={() => doubleClickSelectStore.add(key)}
											class="block min-h-[auto] text-sm rounded border-0 bg-transparent px-3 py-1 outline-none m-0 text-right"
											type="text"
											name="unitPrice_label"
											id="unitPrice_label"
											value={format(
												convertFx(
													$cartStore.get(key)?.orders_details.unitPrice,
													$exchangeRatesStore,
													$selectedCurrencyStore
												),
												$selectedCurrencyStore
											)}
										/>
									{/if}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{format(
										convertFx(
											currency($cartStore.get(key)?.orders_details.unitPrice || '0').multiply(
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
											on:longPress={() => cartStore.subtract(productsOrderDetails.product)}
											use:longPress
											on:click={() => cartStore.subtract(productsOrderDetails.product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500"
										>
											<span>-</span>
										</button>
										<div class="px-3">
											<span>
												{$cartStore.has(key) ? $cartStore.get(key)?.orders_details.quantity : 0}
											</span>
										</div>
										<button
											on:longPress={() => cartStore.add(productsOrderDetails.product)}
											use:longPress
											on:click={() => cartStore.add(productsOrderDetails.product)}
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
										<button on:click={() => cartStore.removeProduct(key)}>
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
								<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
									<div
										class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-1 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										{$customerSelectedStore.fullName}
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
											{$customerSelectedStore.isCorporate}
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
											Amount
										</div>
										<div
											class="ml-auto text-xs text-gray-500 {+$customerSelectedStore.amount < 0
												? 'text-red-500'
												: 'text-green-500'}"
										>
											{format(
												convertFx(
													$customerSelectedStore.amount,
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
													$customerSelectedStore.totalReceipts,
													$exchangeRatesStore,
													$selectedCurrencyStore
												),
												$selectedCurrencyStore
											)}
										</div>
									</div>
									{#if $customerSelectedStore.notes}
										<div class="">
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
											Delivery Date
										</div>
										<div class="ml-auto text-xs text-gray-500">
											<input
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
										class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
									>
										<span class="ml-2">{$pricelistStore.pricelist.id}</span>
										{@html svgDropdown}
									</button>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
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
											{$pricelistStore.pricelist.createdAt}
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
													{list.minimumQuantity}
												</div>
												<div class="ml-auto text-xs text-gray-500">
													{format(
														convertFx(
															calcProductPrices(
																{
																	id: 19,
																	userId: 'ivk4l3dy6enbyjb',
																	name: 'ADMIRABLE.EMB',
																	description: null,
																	productCategory: 'Embroidery',
																	productUnitPrice: null,
																	stitches: 1537,
																	storkQuantity: null,
																	active: true,
																	createdAt: new Date(),
																	updated_at: new Date()
																},
																$pricelistStore,
																list.minimumQuantity,
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
										class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
									>
										<span class="ml-2">{$exchangeRatesStore.exchangeRates.id}</span>
										{@html svgDropdown}
									</button>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
									>
										{#each data.exchangeRateAll as exchange (exchange.exchangeRates.id)}
											{#if !($exchangeRatesStore.exchangeRates.id === exchange.exchangeRates.id)}
												<li>
													<button
														on:click={() => exchangeRatesStore.add(exchange)}
														class="rounded-sm"
													>
														{exchange.exchangeRates.id}
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
											{$exchangeRatesStore.exchangeRates.id}
										</div>
									</div>

									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											default
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$exchangeRatesStore.exchangeRates.default}
										</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									>
										<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
											date created
										</div>
										<div class="ml-auto text-xs text-gray-500">
											{$exchangeRatesStore.exchangeRates.createdAt}
										</div>
									</div>
									<div
										class="flex items-center text-gray-900 dark:text-white mt-0.5 xl:border-t border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
									/>
									{#each $exchangeRatesStore.exchangeRateDetails as [key, value] (key)}
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

<dialog class="modal" class:modal-open={isModalOpen}>
	<div class="modal-box bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800">
		<h3 class="font-bold text-lg">Create Contact</h3>
		<div class="py-4 my-2">
			<form id="createContact" method="POST" action="?/createContact" use:enhance>
				<!--Username input-->
				<div class="relative mb-4">
					<input
						type="text"
						class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
						id="fullName"
						name="fullName"
						placeholder="Full Name"
					/>
					<label
						for="fullName"
						class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
						>Full Name
					</label>
				</div>

				<!-- Corporate  -->
				<div class=" mb-4 ml-3">
					<label class="">
						<input name="isCorporate" type="checkbox" />
						<span class="text-neutral-500 ml-2"> Corporate </span>
					</label>
				</div>

				<!--Vat No or Bp Number-->
				<div class="relative mb-4">
					<input
						type="text"
						class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
						id="vatOrBpNumber"
						name="vatOrBpNumber"
						placeholder="Vat No or Bp Number"
					/>
					<label
						for="vatOrBpNumber"
						class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
						>Vat No or Bp Number
					</label>
				</div>

				<!--Email input-->
				<div class="relative mb-4">
					<input
						type="text"
						class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
						id="email"
						name="email"
						placeholder="Email"
					/>
					<label
						for="email"
						class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
						>Email
					</label>
				</div>

				<!--Phone input-->
				<div class="relative mb-4">
					<input
						type="text"
						class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
						id="phone"
						name="phone"
						placeholder="Phone"
					/>
					<label
						for="phone"
						class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
						>Phone
					</label>
				</div>

				<!--Address input-->
				<div class="relative mb-4">
					<textarea
						class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
						id="address"
						rows="4"
						name="address"
						placeholder="Address"
					/>
					<label
						for="address"
						class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
						>Address
					</label>
				</div>
			</form>
		</div>
		<div class="modal-action">
			<input
				name="cancel"
				class="btn rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 border-none"
				type="button"
				value="Cancel"
				on:click={() => (isModalOpen = false)}
			/>
			<input
				name="cancel"
				class="btn rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 border-none"
				form="createContact"
				value="Submit"
				type="submit"
				on:click={() => (isModalOpen = false)}
			/>
		</div>
	</div>
</dialog>
