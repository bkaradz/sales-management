<script lang="ts">
	import {
		svgBackArrow,
		svgCalender,
		svgDropdown,
		svgDropdownArrow,
		svgForwardArrow,
		svgSearch
	} from '$lib/assets/svgLogos';

	import type { PageData } from './$types';
	import { format } from '$lib/utility/calculateCart.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import { exchangeRatesStore, selectedRateStore } from '$lib/stores/cartStore';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { v4 as uuidv4 } from 'uuid';
	import {
		amountTenderedStore,
		customerStore,
		paymentMethodSelectedStore,
		selectedOrdersPaymentStore,
		selectedOrdersPaymentTotals
	} from '$lib/stores/paymentsStore';
	import type { Orders } from '$lib/server/drizzle/schema/schema';
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toasts.store';
	import { invalidateAll } from '$app/navigation';
	import { paymentMethod } from '$lib/utility/lists.utility';
	import currency from 'currency.js';

	export let data: PageData;

	$: customerStore.add(data.contact?.contact);

	let activitiesTabs = [
		{ id: uuidv4(), name: 'Orders', selected: true },
		{ id: uuidv4(), name: 'Payment', selected: false }
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

	const changeSelection = (event: any, order: Orders) => {
		if (!event.target.checked) {
			selectedOrdersPaymentStore.remove(order.id);
		} else {
			selectedOrdersPaymentStore.add(order);
		}
	};

	const changeAmountTenderedStore = (e: Event) => {
		const target = e.target as HTMLInputElement;
		amountTenderedStore.add(+target.value);
	};

	export let form;

	$: if (form?.success) {
		invalidateAll();
		amountTenderedStore.reset();
		paymentMethodSelectedStore.reset();
		selectedOrdersPaymentStore.reset();
		toasts.add({
			message: 'Payment record added successfully',
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
</script>

<svelte:head>
	<title>Payments</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	<!-- Users Cards -->

	<div
		class="xl:w-72 w-48 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
	>
		<div class="text-3xl text-gray-900 dark:text-white">Contact</div>
		{#if data.contact}
			<div class="space-y-4 mt-3">
				<button class={`bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800`}>
					<div
						class="flex xl:flex-row flex-col items-center font-medium text-gray-900 dark:text-white pb-2 mb-1 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
					>
						{data.contact.contact.full_name}
					</div>
					<div
						class="flex items-center text-gray-900 dark:text-white py-2 xl:border-y border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
					>
						<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Id</div>
						<div class="ml-auto text-xs text-gray-500">{data.contact.contact.id}</div>
					</div>
					<div
						class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
					>
						<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
							Corporate
						</div>
						<div class="ml-auto text-xs text-gray-500">{data.contact.contact.is_corporate}</div>
					</div>
					<div
						class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
					>
						<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Active</div>
						<div class="ml-auto text-xs text-gray-500">{data.contact.contact.active}</div>
					</div>
					<div
						class="flex items-center text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
					>
						<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Balance</div>
						<div class="ml-auto text-xs text-gray-500">
							{format(
								converter(
									data.contact.contact.orders_totals,
									$selectedRateStore,
									$exchangeRatesStore
								),
								$selectedRateStore
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
									data.contact.contact.total_receipts,
									$selectedRateStore,
									$exchangeRatesStore
								),
								$selectedRateStore
							)}
						</div>
					</div>
					{#if data.contact.contact.notes}
						<div
							class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
						>
							<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Notes</div>
							<div class="ml-auto text-xs text-gray-500">{data.contact.contact.notes}</div>
						</div>
					{/if}
					{#each data.contact.phones as phone (phone.id)}
						<div
							class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
						>
							<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Phone</div>
							<div class="ml-auto text-xs text-gray-500">{phone.phone}</div>
						</div>
					{/each}
					{#each data.contact.emails as email (email.id)}
						<div
							class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
						>
							<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Email</div>
							<div class="ml-auto text-xs text-gray-500">{email.email}</div>
						</div>
					{/each}
					{#each data.contact.address as address (address.id)}
						<div
							class="flex items-center mb-2 text-gray-900 dark:text-white py-2 xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700 w-full"
						>
							<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>
								Address
							</div>
							<div class="ml-auto text-xs text-gray-500">{address.address}</div>
						</div>
					{/each}
				</button>
			</div>
		{/if}
	</div>

	<!-- Orders Table -->

	<div class="flex-grow flex overflow-x-hidden">
		{#if data.shop_orders}
			<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
				<div
					class="z-10 sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white sticky top-0"
				>
					<div class="flex w-full items-center justify-between">
						<div class="flex items-center text-3xl text-gray-900 dark:text-white">Orders</div>

						<div class="flex">
							<div class="dropdown dropdown-bottom dropdown-end mr-8">
								<button
									tabindex="0"
									class="flex items-center h-8 px-3 rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
								>
									<span class="ml-2">{$paymentMethodSelectedStore}</span>
									{@html svgDropdown}
								</button>
								<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
								<ul
									tabindex="0"
									class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
								>
									{#each paymentMethod as type (type)}
										{#if !(type === $paymentMethodSelectedStore)}
											<li>
												<button
													on:click={() => paymentMethodSelectedStore.add(type)}
													class="rounded-sm"
												>
													{type}
												</button>
											</li>
										{/if}
									{/each}
								</ul>
							</div>

							<form action="?/submit" method="post" use:enhance>
								<input
									hidden
									name="amount_tendered"
									type="text"
									value={JSON.stringify($selectedOrdersPaymentTotals.amountTendered)}
								/>
								<input
									hidden
									name="selected_orders_total"
									type="text"
									value={JSON.stringify($selectedOrdersPaymentTotals.selectedOrdersTotal)}
								/>
								<input
									hidden
									name="selected_orders_ids"
									type="text"
									value={JSON.stringify(
										[...$selectedOrdersPaymentStore.values()].map((item) => item.id)
									)}
								/>
								<input hidden name="customer_id" type="number" value={data?.contact?.contact?.id} />
								<input
									hidden
									name="payment_method"
									type="number"
									value={$paymentMethodSelectedStore}
								/>

								{#if $selectedOrdersPaymentStore.size >= 1 && currency($selectedOrdersPaymentTotals.totalDue).value <= 0}
									<button
										type="submit"
										class="h-8 px-3 rounded-md shadow text-white bg-blue-500 mr-8"
									>
										Submit
									</button>
								{/if}
							</form>

							<div class="text-right mr-8">
								<div class="text-xs text-gray-400 dark:text-gray-400">Total Products:</div>
								<div class="text-gray-900 text-lg dark:text-white">
									{$selectedOrdersPaymentTotals.totalProducts}
								</div>
							</div>

							<div class="text-right">
								<div class="text-xs text-gray-400 dark:text-gray-400">Selected Orders Totals:</div>
								<div class="text-gray-900 text-lg dark:text-white">
									{format(
										converter(
											$selectedOrdersPaymentTotals.selectedOrdersTotal,
											$selectedRateStore,
											$exchangeRatesStore
										),
										$selectedRateStore
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
				{#if selectedActivitiesTab.name === 'Orders'}
					<!-- pagination -->
					<div
						class="z-5 sm:px-7 px-4 flex flex-col w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white sticky top-0"
					>
						<div class="flex w-full items-center my-3">
							<button
								class="inline-flex mr-3 items-center h-8 pl-2.5 pr-2 rounded-md shadow text-gray-700 dark:text-gray-400 dark:border-gray-800 border border-gray-200 leading-none py-0"
							>
								{@html svgCalender}
								Last 30 days
								{@html svgDropdownArrow}
							</button>
							<button
								class="inline-flex items-center h-8 pl-2.5 pr-2 rounded-md shadow text-gray-700 dark:text-gray-400 dark:border-gray-800 border border-gray-200 leading-none py-0"
							>
								Filter by
								{@html svgDropdownArrow}
							</button>
							<div class="relative ml-3">
								<form data-sveltekit-keepfocus data-sveltekit-replacestate method="get">
									<input type="hidden" name="limit" value={data.shop_orders.pagination.limit} />
									<input
										type="hidden"
										name="page"
										value={data.shop_orders.pagination.previous?.page || 1}
									/>
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

							<div class="ml-auto text-gray-500 text-xs sm:inline-flex hidden items-center">
								<div>
									<span class="mr-3"
										>Page {data.shop_orders.pagination.page} of {data.shop_orders.pagination
											.totalPages}</span
									>
									<form class="inline-block" method="get">
										<input
											type="hidden"
											name="page"
											value={data.shop_orders.pagination.previous?.page || 1}
										/>
										<input type="hidden" name="limit" value={data.shop_orders.pagination.limit} />
										<input
											type="hidden"
											name="search"
											value={data.shop_orders.pagination.search || ''}
										/>
										<button
											type="submit"
											class="{!data.shop_orders.pagination.previous
												? 'cursor-not-allowed'
												: ''} inline-flex mr-2 items-center h-8 w-8 justify-center text-gray-400 rounded-md shadow border border-gray-200 dark:border-gray-800 leading-none py-0"
											disabled={!data.shop_orders.pagination.previous}
										>
											{@html svgBackArrow}
										</button>
									</form>
									<form class="inline-block" method="get">
										<input
											type="hidden"
											name="page"
											value={data.shop_orders.pagination.next?.page || 1}
										/>
										<input type="hidden" name="limit" value={data.shop_orders.pagination.limit} />
										<input
											type="hidden"
											name="search"
											value={data.shop_orders.pagination.search || ''}
										/>
										<button
											type="submit"
											class="{!data.shop_orders.pagination.next
												? 'cursor-not-allowed'
												: ''} inline-flex items-center h-8 w-8 justify-center text-gray-400 rounded-md shadow border border-gray-200 dark:border-gray-800 leading-none py-0"
											disabled={!data.shop_orders.pagination.next}
										>
											{@html svgForwardArrow}
										</button>
									</form>
								</div>
								<div class="ml-3 items-center flex">
									<span class="mr-2">Show</span>
									<form data-sveltekit-keepfocus data-sveltekit-replacestate method="get">
										<input
											use:selectTextOnFocus
											type="number"
											class="appearance-none h-8 mr-2 w-20 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-md text-sm"
											value={data.shop_orders.pagination.limit}
											name="limit"
											on:input={debounceSearch}
											on:change={debounceSearch}
										/>
									</form>
									<span class="">of {data.shop_orders.pagination.totalRecords} entries</span>
								</div>
							</div>
						</div>
					</div>
					<!-- pagination end -->
					<!-- Table -->
					<div class="sm:p-7 p-4">
						<table class="table table-sm">
							<thead>
								<tr class="text-gray-400">
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										Selected
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										Order Id
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										Pricelist Id
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										Exchange Rate Id
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-center"
									>
										Sales Status
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-center"
									>
										Payment Status
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										Total Products
									</th>
									<th
										class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										Sales Amount
									</th>
								</tr>
							</thead>
							<tbody class="text-gray-600 dark:text-gray-100">
								{#each data.shop_orders.shop_orders as ordersArray (ordersArray.shop_orders.id)}
									<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
										>
											<input
												name="selected"
												type="checkbox"
												checked={$selectedOrdersPaymentStore.has(ordersArray.shop_orders.id)}
												on:click={(event) => changeSelection(event, ordersArray.shop_orders)}
											/>
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
										>
											<span
												class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md"
											>
												{ordersArray.shop_orders.id}
											</span>
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
										>
											<span
												class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md"
											>
												{ordersArray.shop_orders.pricelist_id}
											</span>
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
										>
											<span
												class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md"
											>
												{ordersArray.shop_orders.exchange_rates_id}
											</span>
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
										>
											<span
												class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md"
											>
												{ordersArray.shop_orders.sales_status}
											</span>
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
										>
											<span
												class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md"
											>
												{ordersArray.shop_orders.payment_status}
											</span>
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
										>
											{ordersArray.shop_orders.total_products}
										</td>
										<td
											class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
										>
											{format(
												converter(
													ordersArray.shop_orders.sales_amount,
													$selectedRateStore,
													$exchangeRatesStore
												),
												$selectedRateStore
											)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
				{#if selectedActivitiesTab.name === 'Payment'}
					<div class="grid grid-cols-1 gap-4">
						<div
							class="px-4 md:px-0 lg:w-6/12 bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 m-auto"
						>
							<div class="md:mx-6 md:p-12">
								<div class="text-center">
									<h4 class="mb-6 pb-1 text-xl font-semibold">Payment</h4>
								</div>

								<!--Grand Total-->
								<div class="mb-8">
									<div class="grid grid-cols-2">
										<div class="relative">
											<span class="pointer-events-none">Grand Total </span>
										</div>
										<div class="relative">
											<span>
												{format(
													converter(
														$selectedOrdersPaymentTotals.selectedOrdersTotal,
														$selectedRateStore,
														$exchangeRatesStore
													),
													$selectedRateStore
												)}
											</span>
										</div>
									</div>
								</div>

								<div class="mb-8">
									<div class="grid grid-cols-2">
										<div class="relative">
											<span class="pointer-events-none">Customer Deposit</span>
										</div>
										<div class="relative">
											<span>
												{format(
													converter(
														$selectedOrdersPaymentTotals.customerDeposit,
														$selectedRateStore,
														$exchangeRatesStore
													),
													$selectedRateStore
												)}
											</span>
										</div>
									</div>
								</div>

								<!--Amount Tendered-->
								<div class="mb-8">
									<div class="grid grid-cols-2">
										<div class="relative">
											<span class="pointer-events-none">Amount Tender </span>
										</div>
										<div class="relative">
											<input
												type="number"
												min="1"
												step=".01"
												class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
												id="unit_price_label"
												name="unit_price_label"
												value={$amountTenderedStore}
												placeholder="Amount"
												use:selectTextOnFocus
												on:change|preventDefault={(e) => changeAmountTenderedStore(e)}
												on:input|preventDefault={(e) => changeAmountTenderedStore(e)}
											/>
											<label
												for="unit_price_label"
												class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
												>Amount
											</label>
										</div>
									</div>
								</div>

								<!--Total Due-->
								<div class="mb-8">
									<div class="grid grid-cols-2">
										<div class="relative">
											<span class="pointer-events-none">Total Due </span>
										</div>
										<div class="relative">
											<span>
												{format(
													converter(
														$selectedOrdersPaymentTotals.totalDue,
														$selectedRateStore,
														$exchangeRatesStore
													),
													$selectedRateStore
												)}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
