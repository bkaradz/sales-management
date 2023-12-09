<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		svgBackArrow,
		svgBin,
		svgCalender,
		svgCard,
		svgDoubleArrows,
		svgDropdownArrow,
		svgEye,
		svgForwardArrow,
		svgPen,
		svgSearch
	} from '$lib/assets/svgLogos';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import type { PageData } from './$types';
	import { format } from '$lib/utility/calculateCart.util';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import {
		exchangeRatesStore,
		paymentStatusSelectedStore,
		salesStatusSelectedStore,
		selectedRateStore
	} from '$lib/stores/cartStore';
	import { salesStatus, type PaymentStatusUnion, type SalesStatusUnion } from '$lib/utility/lists.utility';

	export let data: PageData;
	
	let checkedMap = new Map<number, boolean>();

	const changeSelection = (event: any, id: number, salesStatus: SalesStatusUnion, paymentStatus: PaymentStatusUnion) => {
		checkedMap = new Map();
		checkedMap.set(id, true);
		checkedMap = checkedMap;
		salesStatusSelectedStore.add(salesStatus);
		paymentStatusSelectedStore.add(paymentStatus)
		if (!event.target.checked) {
			checkedMap = new Map();
		}
	};

	export const SalesStatusProgress: { number: number; status: SalesStatusUnion }[] = salesStatus.map((status, index) => {
		return { number: index + 1, status: status }
	})
	
</script>

<svelte:head>
	<title>Sales</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	{#if data.results?.shop_orders}
		<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
			<div
				class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
			>
				<div class="flex w-full items-center border-b border-gray-200 dark:border-gray-800">
					<div class="flex items-center text-3xl text-gray-900 dark:text-white">Orders</div>
				</div>

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
							<input type="hidden" name="limit" value={data?.results.pagination.limit} />
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
					<div class="ml-3">
						{#if checkedMap.size !== 0}
							<ol
								class="flex items-center w-full py-1 px-2 space-x-2 text-sm font-medium text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 sm:text-base dark:bg-gray-800 dark:border-gray-700 sm:space-x-4"
							>
								{#each SalesStatusProgress as status (status.number)}
									<li
										class={`flex items-center ${
											status.status === $salesStatusSelectedStore
												? 'text-blue-600 dark:text-blue-500'
												: ''
										}`}
									>
										<span
											class="flex items-center justify-center w-5 h-5 mr-2 text-xs border border-blue-600 rounded-full shrink-0 dark:border-blue-500"
										>
											{status.number}
										</span>
										<form action="?/salesStatus" method="post">
											<input type="hidden" name="sales_status" value={status.status} />
											<input type="hidden" name="payment_status" value={$paymentStatusSelectedStore} />
											<input type="hidden" name="id" value={Array.from(checkedMap.keys())[0] || 0} />
											<button type="submit" class="hidden sm:inline-flex sm:ml-2 text-sm">{status.status}</button>
										</form>
									{@html svgDoubleArrows}
									</li>
								{/each}
							</ol>
						{/if}
					</div>
					<div class="ml-auto text-gray-500 text-xs sm:inline-flex hidden items-center">
						<div>
							<span class="mr-3"
								>Page {data?.results.pagination.page} of {data?.results.pagination.totalPages}</span
							>
							<form class="inline-block" method="get">
								<input type="hidden" name="page" value={data?.results.pagination.previous?.page} />
								<input type="hidden" name="limit" value={data?.results.pagination.limit} />
								<button
									type="submit"
									class="{!data?.results.pagination.previous
										? 'cursor-not-allowed'
										: ''} inline-flex mr-2 items-center h-8 w-8 justify-center text-gray-400 rounded-md shadow border border-gray-200 dark:border-gray-800 leading-none py-0"
									disabled={!data?.results.pagination.previous}
								>
									{@html svgBackArrow}
								</button>
							</form>
							<form class="inline-block" method="get">
								<input type="hidden" name="page" value={data?.results.pagination.next?.page} />
								<input type="hidden" name="limit" value={data?.results.pagination.limit} />
								<button
									type="submit"
									class="{!data?.results.pagination.next
										? 'cursor-not-allowed'
										: ''} inline-flex items-center h-8 w-8 justify-center text-gray-400 rounded-md shadow border border-gray-200 dark:border-gray-800 leading-none py-0"
									disabled={!data?.results.pagination.next}
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
									value={data?.results.pagination.limit}
									name="limit"
									on:input={debounceSearch}
									on:change={debounceSearch}
								/>
							</form>
							<span class="">of {data?.results.pagination.totalRecords} entries</span>
						</div>
					</div>
				</div>
			</div>
			<div class="sm:p-7 p-4">
				<table class="table table-sm">
					<thead>
						<tr class="text-gray-400">
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Selected
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Order Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Full Name/Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Balance
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Pricelist Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Exchange Rate Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Sales Status
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Payments Status
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Total Products
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Total
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Actions
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Payments
							</th>
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-100">
						{#each data.results?.shop_orders as order (order.shop_orders.id)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<input
										name="selected"
										type="checkbox"
										checked={checkedMap.has(order.shop_orders.id)}
										on:click={(event) =>
											changeSelection(event, order.shop_orders.id, order.shop_orders.sales_status, order.shop_orders.payment_status)}
									/>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.shop_orders.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.contacts?.full_name}
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.contacts?.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										converter(
											order.contacts?.orders_totals,
											$selectedRateStore,
											$exchangeRatesStore
										),
										$selectedRateStore
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.shop_orders.pricelist_id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.shop_orders.exchange_rates_id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-full">
										{order.shop_orders.sales_status}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-full">
										{order.shop_orders.payment_status}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.shop_orders.total_products}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										converter(
											order.shop_orders.sales_amount,
											$selectedRateStore,
											$exchangeRatesStore
										),
										$selectedRateStore
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<a href={`/sales/view/${order.shop_orders.id}`}>
											{@html svgEye}
										</a>
										<a href={`/sales/edit/${order.shop_orders.id}`} class="px-2">
											{@html svgPen}
										</a>
										<form action="?/delete" method="post" use:enhance>
											<input type="hidden" name="id" value={order.shop_orders.id} />
											<input type="hidden" name="sales_status" value={order.shop_orders.sales_status} />
											<input type="hidden" name="payment_status" value={order.shop_orders.payment_status} />
											<button type="submit">
												{@html svgBin}
											</button>
										</form>
									</div>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<a href={`/sales/payment/${order.contacts.id}`} class="pr-2">
											{@html svgCard}
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
