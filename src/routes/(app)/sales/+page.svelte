<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		svgBackArrow,
		svgBin,
		svgCalender,
		svgDropdownArrow,
		svgEye,
		svgForwardArrow,
		svgPen,
		svgSearch,
		svgThreeDots
	} from '$lib/assets/svgLogos';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { dinero } from 'dinero.js';
	import type { PageData } from './$types';
	import { addMany, format } from '$lib/utility/calculateCart.util';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import { exchangeRatesStore, selectedRateStore } from '$lib/stores/cartStore';

	export let data: PageData;
</script>

<div class="flex-grow flex overflow-x-hidden">
	{#if data.results?.orders}
		<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
			<div
				class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
			>
				<div class="flex w-full items-center">
					<div class="flex items-center text-3xl text-gray-900 dark:text-white">Orders</div>
					<div class="ml-auto sm:flex hidden items-center justify-end">
						<div class="text-right">
							<div class="text-xs text-gray-400 dark:text-gray-400">Account balance:</div>
							<div class="text-gray-900 text-lg dark:text-white">$2,794.00</div>
						</div>
						<button
							class="w-8 h-8 ml-4 text-gray-400 shadow dark:text-gray-400 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700"
						>
							{@html svgThreeDots}
						</button>
					</div>
				</div>
			</div>
			<div class="sm:p-7 p-4">
				<div class="flex w-full items-center mb-7">
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

				<table class="table table-sm">
					<thead>
						<tr class="text-gray-400">
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
								Total Products
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Total
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-100">
						{#each data.results?.orders as order (order.orders.id)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none dark:bg-blue-500 rounded-md">										
										{order.orders.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.contacts?.full_name}
									<span class="text-xs py-1 px-2 leading-none dark:bg-blue-500 rounded-md">
										{order.contacts?.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										converter(
											dinero(order.contacts?.balance_due),
											$selectedRateStore,
											$exchangeRatesStore
										)
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none dark:bg-blue-500 rounded-md">
										{order.orders.pricelist_id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none dark:bg-blue-500 rounded-md">
										{order.orders.exchange_rates_id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.orders_details.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										converter(
											addMany(order.orders_details.map((item) => dinero(item.total_price))),
											$selectedRateStore,
											$exchangeRatesStore
										)
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<a href={`/sales/view/${order.orders.id}`}>
											{@html svgEye}
										</a>
										<a href={`/cart/${order.orders.id}`} class="px-2">
											{@html svgPen}
										</a>
										<form action="?/delete" method="post" use:enhance>
											<input type="hidden" name="delete" value={order.orders.id} />
											<button type="submit">
												{@html svgBin}
											</button>
										</form>
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
