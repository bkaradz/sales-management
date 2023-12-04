<script lang="ts">
	import {
		svgBackArrow,
		svgCalender,
		svgDoubleArrows,
		svgDropdownArrow,
		svgForwardArrow,
		svgSearch
	} from '$lib/assets/svgLogos';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import type { PageData } from './$types';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import {
		paymentStatusSelectedStore,
		productionStatusSelectedStore,
		salesStatusSelectedStore
	} from '$lib/stores/cartStore';
	import { productionStatus, type PaymentStatusUnion, type SalesStatusUnion, type ProductionStatusUnion } from '$lib/utility/lists.utility';

	export let data: PageData;

	let checkedMap = new Map<number, boolean>();

	const changeSelection = (
		event: any,
		id: number,
		status: ProductionStatusUnion,
		salesStatus: SalesStatusUnion,
		paymentStatus: PaymentStatusUnion
	) => {
		checkedMap = new Map();
		checkedMap.set(id, true);
		checkedMap = checkedMap;
		productionStatusSelectedStore.add(status);
		salesStatusSelectedStore.add(salesStatus);
		paymentStatusSelectedStore.add(paymentStatus);
		if (!event.target.checked) {
			checkedMap = new Map();
		}
	};

	export const productionStatusProgress: { number: number; status: ProductionStatusUnion }[] = productionStatus.map((status, index) => {
		return { number: index + 1, status }
	})
	
</script>

<svelte:head>
	<title>Production</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	{#if data.results?.orders}
		<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
			<div
				class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
			>
				<div class="flex w-full items-center border-b border-gray-200 dark:border-gray-800">
					<div class="flex items-center text-3xl text-gray-900 dark:text-white">Production</div>
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
								{#each productionStatusProgress as status (status.number)}
									<li
										class={`flex items-center ${
											status.status === $productionStatusSelectedStore
												? 'text-blue-600 dark:text-blue-500'
												: ''
										}`}
									>
										<span
											class="flex items-center justify-center w-5 h-5 mr-2 text-xs border border-blue-600 rounded-full shrink-0 dark:border-blue-500"
										>
											{status.number}
										</span>
										<form action="?/productionStatus" method="post">
											<input type="hidden" name="sales_status" value={$salesStatusSelectedStore} />
											<input
												type="hidden"
												name="payment_status"
												value={$paymentStatusSelectedStore}
											/>
											<input type="hidden" name="production_status" value={status.status} />
											<input
												type="hidden"
												name="id"
												value={Array.from(checkedMap.keys())[0] || 0}
											/>
											<button type="submit" class="hidden sm:inline-flex sm:ml-2 text-sm"
												>{status.status}</button
											>
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
								Client Name/Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Job Name/Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Stitches
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								No of Units
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Placement
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Production Status
							</th>
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-100">
						{#each data.results?.orders as order (order.orders_details.id)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<input
										name="selection"
										type="checkbox"
										checked={checkedMap.has(order.orders_details.id)}
										on:click={(event) =>
											changeSelection(
												event,
												order.orders_details.id,
												order.orders_details.production_status,
												order.orders.sales_status,
												order.orders.payment_status
											)}
									/>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.orders.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.contacts?.full_name}
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.contacts?.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.products.name}
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{order.products.id}
									</span>
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{order.orders_details.stitches}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{order.orders_details.quantity}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{order.orders_details.garment_placement}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-full">
										{order.orders_details.production_status}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
