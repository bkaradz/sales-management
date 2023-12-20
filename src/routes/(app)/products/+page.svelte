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
		svgSearch
	} from '$lib/assets/svgLogos';
	import { longPress, selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import type { PageData } from './$types';
	import { format } from '$lib/utility/calculateCart.util';
	import {
		cartStore,
		cartTotalsStore,
		exchangeRatesStore,
		selectedCurrencyStore
	} from '$lib/stores/cartStore';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import currency from 'currency.js';
	import { multiply } from 'lodash-es';

	export let data: PageData;

	let isModalOpen = false;
	let deletedProduct = { productId: null, productName: null } as {
		productId: null | number;
		productName: null | string;
	};
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	{#if data.results?.products}
		<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
			<div
				class="z-10 sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white sticky top-0"
			>
				<div class="flex w-full items-center border-b border-gray-200 dark:border-gray-800">
					<div class="flex items-center text-3xl text-gray-900 dark:text-white">Products</div>
					<div class="ml-auto sm:flex hidden items-center justify-end">
						<div class="text-right mr-8">
							<div class="text-xs text-gray-400 dark:text-gray-400">Total Products:</div>
							<div class="text-gray-900 text-lg dark:text-white">
								{$cartTotalsStore.totalProduct}
							</div>
						</div>
						<div class="text-right mr-8">
							<div class="text-xs text-gray-400 dark:text-gray-400">Sub Total:</div>
							<div class="text-gray-900 text-lg dark:text-white">
								{format(
									converter($cartTotalsStore.sub_total, $selectedCurrencyStore, $exchangeRatesStore),
									$selectedCurrencyStore
								)}
							</div>
						</div>
						<div class="text-right mr-8">
							<div class="text-xs text-gray-400 dark:text-gray-400">Tax:</div>
							<div class="text-gray-900 text-lg dark:text-white">
								{format(
									converter($cartTotalsStore.vat, $selectedCurrencyStore, $exchangeRatesStore),
									$selectedCurrencyStore
								)}
							</div>
						</div>
						<div class="text-right mr-8">
							<div class="text-xs text-gray-400 dark:text-gray-400">Net Total:</div>
							<div class="text-gray-900 text-lg dark:text-white">
								{format(
									converter($cartTotalsStore.grand_total, $selectedCurrencyStore, $exchangeRatesStore),
									$selectedCurrencyStore
								)}
							</div>
						</div>
					</div>
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
							<input type="hidden" name="limit" value={data?.results.pagination.limit} />
							<input
								type="hidden"
								name="page"
								value={data?.results.pagination.previous?.page || 1}
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
								>Page {data?.results.pagination.page} of {data?.results.pagination.totalPages}</span
							>
							<form class="inline-block" method="get">
								<input
									type="hidden"
									name="page"
									value={data?.results.pagination.previous?.page || 1}
								/>
								<input type="hidden" name="limit" value={data?.results.pagination.limit} />
								<input type="hidden" name="search" value={data?.results.pagination.search || ''} />
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
								<input type="hidden" name="page" value={data?.results.pagination.next?.page || 1} />
								<input type="hidden" name="limit" value={data?.results.pagination.limit} />
								<input type="hidden" name="search" value={data?.results.pagination.search || ''} />
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
				<!-- pagination end -->
			</div>
			<!-- Table -->
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
							<th
								class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
							>
								Stitches
							</th>
							<th
								class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
							>
								Units
							</th>
							<th
								class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
							>
								Unit Price
							</th>
							<th
								class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-right"
							>
								Total Price
							</th>
							<th
								class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800 text-center"
							>
								Product Categories
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
						{#each data.results.products as product (product.id)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{product.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{product.name}
									{#if product.stork_quantity}
										<span
											class="text-xs py-1 px-2 leading-none bg-green-100 text-green-600 dark:bg-gray-800 rounded-md"
										>
											{product.stork_quantity}
										</span>
									{/if}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{product.stitches || 'None'}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{$cartStore.has(product.id)
										? $cartStore.get(product.id)?.orders_details.quantity
										: 0}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{format(
										converter(
											$cartStore.get(product.id)?.orders_details?.unit_price || '0',
											$selectedCurrencyStore,
											$exchangeRatesStore
										),
										$selectedCurrencyStore
									)}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-right"
								>
									{format(
										converter(
											currency(
												$cartStore.get(product.id)?.orders_details?.unit_price || '0'
											).multiply($cartStore.get(product.id)?.orders_details?.quantity || '0'),
											$selectedCurrencyStore,
											$exchangeRatesStore
										),
										$selectedCurrencyStore
									)}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 text-center"
								>
									{product.product_category}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<button
											on:longPress={() => cartStore.subtract(product)}
											use:longPress
											on:click={() => cartStore.subtract(product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500"
										>
											<span>-</span>
										</button>
										<div class="px-3">
											<span>
												{$cartStore.has(product.id)
													? $cartStore.get(product.id)?.orders_details.quantity
													: 0}
											</span>
										</div>
										<button
											on:longPress={() => cartStore.add(product)}
											use:longPress
											on:click={() => cartStore.add(product)}
											class="dark:bg-slate-600 bg-slate-200 px-2 hover:bg-blue-500"
										>
											<span>+</span>
										</button>
									</div>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<a href={`/products/view/${product.id}`}>
											{@html svgEye}
										</a>
										<a href={`/products/edit/${product.id}`} class="px-2">
											{@html svgPen}
										</a>
										<form id="deleteForm" action="?/delete" method="post" use:enhance>
											<input type="hidden" name="delete" value={product.id} />
											<a
												href="#!"
												on:click={() => {
													isModalOpen = true;
													deletedProduct = { productId: product.id, productName: product.name };
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

<dialog class="modal" class:modal-open={isModalOpen}>
	<div class="modal-box bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800">
		<h3 class="font-bold text-lg">Are you sure you want to delete product !!!</h3>
		<div class="py-4 my-2">
			<p class="py-4">
				Id:
				<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
					{deletedProduct.productId}
				</span>
			</p>
			<p>
				Name:
				<span
					class="text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md bg-green-100 text-green-600"
				>
					{deletedProduct.productName}
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
