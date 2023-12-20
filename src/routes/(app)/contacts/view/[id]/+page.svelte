<script lang="ts">
	import {
		svgBackArrow,
		svgBin,
		svgCalender,
		svgDropdownArrow,
		svgEye,
		svgForwardArrow,
		svgPen,
		svgSearch
	} from '$lib/assets/svgLogos';
	import type { PageData } from './$types';
	import { format } from '$lib/utility/calculateCart.util';
	import { convertFx } from '$lib/utility/currencyConvertor.util';
	import { exchangeRatesStore, selectedCurrencyStore } from '$lib/stores/cartStore';
	import { enhance } from '$app/forms';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';

	export let data: PageData;

	let isModalOpen = false;
	let deletedOrder = { orderId: null } as { orderId: null | number };
</script>

<svelte:head>
	<title>View Contact</title>
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
						<div class={`text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md`}>Amount</div>
						<div class="ml-auto text-xs text-gray-500 {+data.contact.contact.amount < 0 ? 'text-red-500' : 'text-green-500'}">
							{format(
								convertFx(
									data.contact.contact.amount,
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
									data.contact.contact.total_receipts,
									$exchangeRatesStore,
									$selectedCurrencyStore
								),
								$selectedCurrencyStore
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
					class=" z-10 sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white sticky top-0"
				>
					<div class="flex w-full items-center border-b border-gray-200 dark:border-gray-800">
						<div class="flex items-center text-3xl text-gray-900 dark:text-white">Orders</div>
					</div>
					<!-- pagination -->
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
									>Page {data.shop_orders.pagination.page} of {data.shop_orders.pagination.totalPages}</span
								>
								<form class="inline-block" method="get">
									<input
										type="hidden"
										name="page"
										value={data.shop_orders.pagination.previous?.page || 1}
									/>
									<input type="hidden" name="limit" value={data.shop_orders.pagination.limit} />
									<input type="hidden" name="search" value={data.shop_orders.pagination.search || ''} />
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
									<input type="hidden" name="page" value={data.shop_orders.pagination.next?.page || 1} />
									<input type="hidden" name="limit" value={data.shop_orders.pagination.limit} />
									<input type="hidden" name="search" value={data.shop_orders.pagination.search || ''} />
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
					<!-- pagination end -->
				</div>
				<!-- Table -->
				<div class="sm:p-7 p-4">
					<table class="table table-sm">
						<thead>
							<tr class="text-gray-400">
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
								<th
									class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="text-gray-600 dark:text-gray-100">
							{#each data.shop_orders.shop_orders as ordersArray (ordersArray.id)}
								<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
											{ordersArray.id}
										</span>
									</td>
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
											{ordersArray.pricelist_id}
										</span>
									</td>
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
											{ordersArray.exchange_rates_id}
										</span>
									</td>
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
									>
										<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
											{ordersArray.sales_status}
										</span>
									</td>
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
									>
										<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
											{ordersArray.payment_status}
										</span>
									</td>
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										{ordersArray.total_products}
									</td>
									<td
										class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
									>
										{format(
											convertFx(
												ordersArray.sales_amount,
												$exchangeRatesStore,
												$selectedCurrencyStore
											),
											$selectedCurrencyStore
										)}
									</td>
									<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
										<div class="flex items-center">
											<a href={`/sales/view/${ordersArray.id}`}>
												{@html svgEye}
											</a>
											<a href={`/sales/edit/${ordersArray.id}`} class="px-2">
												{@html svgPen}
											</a>
											<form action="?/delete" method="post" use:enhance>
												<input type="hidden" name="delete" value={ordersArray.id} />
												<a
													href="#!"
													on:click={() => {
														isModalOpen = true;
														deletedOrder = { orderId: ordersArray.id };
													}}
												>
													{@html svgBin}
												</a>
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
</div>

<dialog class="modal" class:modal-open={isModalOpen}>
	<div class="modal-box bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800">
		<h3 class="font-bold text-lg">Are you sure you want to delete order !!!</h3>
		<div class="py-4 my-2">
			<p class="py-4">
				Id:
				<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
					{deletedOrder.orderId}
				</span>
			</p>
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
				name="submit"
				class="btn rounded-md shadow text-white bg-blue-500 hover:bg-blue-400 border-none"
				form="deleteForm"
				value="Yes Delete"
				type="submit"
				on:click={() => (isModalOpen = false)}
			/>
		</div>
	</div>
</dialog>
