<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		svgBackArrow,
		svgBin,
		svgCalender,
		svgCard,
		svgDropdownArrow,
		svgEye,
		svgForwardArrow,
		svgPen,
		svgSearch,
		svgThreeDots
	} from '$lib/assets/svgLogos';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import type { ActionData, PageData } from './$types';
	import { format } from '$lib/utility/calculateCart.util';
	import { debounceSearch } from '$lib/utility/debounceSearch.util';
	import { convertFx } from '$lib/utility/currencyConvertor.util';
	import { exchangeRatesStore, selectedCurrencyStore } from '$lib/stores/cartStore';
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';

	export let data: PageData;
	export let form: ActionData;

	const returnColour = (number: string) => {
		if (+number === 0) {
			// return `text-orange-500`
			return `text-gray-500`
		}
		if (+number > 0) {
			return `text-green-500`
		}
		if (+number < 0) {
			return `text-red-500`
		}
	}

	let isModalOpen = false;
	let deletedContact = { contactId: null, contactName: null } as {
		contactId: null | number;
		contactName: null | string;
	};

	$: if (form?.success) {
		invalidateAll();
		toasts.add({
			message: 'Contact deleted successfully',
			type: 'success'
		});
	} else {
		// if (form?.errors instanceof Map) {
		// 	for (const [key, value] of form.errors.entries()) {
		// 		toasts.add({
		// 			message: `${key.charAt(0).toUpperCase() + key.slice(1)} = ${value}`,
		// 			type: 'error'
		// 		});
		// 	}
		// }
	}
</script>

<svelte:head>
	<title>Contacts</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	{#if data.results?.contacts}
		<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
			<div
				class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
			>
				<div class="flex w-full items-center border-b border-gray-200 dark:border-gray-800">
					<div class="flex items-center text-3xl text-gray-900 dark:text-white">Contacts</div>
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
								type="search"
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
			</div>
			<div class="sm:p-7 p-4">
				<table class="table table-sm">
					<thead>
						<tr class="text-gray-400">
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Id
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Full Name
							</th>
							<!-- <th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Amounts
							</th> -->
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Amount
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Sales Amounts
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Total Products
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Actions
							</th>
							<th class="font-normal px-3 pt-0 pb-3 border-b border-gray-200 dark:border-gray-800">
								Payment
							</th>
						</tr>
					</thead>
					<tbody class="text-gray-600 dark:text-gray-100">
						{#each data.results?.contacts as contact (contact.id)}
							<tr class="hover:bg-gray-100 hover:dark:bg-gray-500">
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
										{contact.id}
									</span>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{contact.full_name}
								</td>
								<td
									class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800 {returnColour(contact.amount)}"
								>
									{format(
										convertFx(contact.amount, $exchangeRatesStore, $selectedCurrencyStore),
										$selectedCurrencyStore
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{format(
										convertFx(contact.sales_amount, $exchangeRatesStore, $selectedCurrencyStore),
										$selectedCurrencyStore
									)}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									{contact.total_products}
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<a href={`/contacts/view/${contact.id}`}>
											{@html svgEye}
										</a>
										<a href={`/contacts/edit/${contact.id}`} class="px-2">
											{@html svgPen}
										</a>
										<form id="deleteForm" action="?/delete" method="post" use:enhance>
											<input type="hidden" name="delete" value={contact.id} />
											<a
												href="#!"
												on:click={() => {
													isModalOpen = true;
													deletedContact = {
														contactId: contact.id,
														contactName: contact.full_name
													};
												}}
											>
												{@html svgBin}
											</a>
										</form>
									</div>
								</td>
								<td class="sm:p-3 py-2 px-1 border-b border-gray-200 dark:border-gray-800">
									<div class="flex items-center">
										<a href={`/sales/payment/${contact.id}`} class="pr-2">
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

<dialog class="modal" class:modal-open={isModalOpen}>
	<div class="modal-box bg-white p-3 w-full flex flex-col rounded-md dark:bg-gray-800">
		<h3 class="font-bold text-lg">Are you sure you want to delete contact !!!</h3>
		<div class="py-4 my-2">
			<p class="py-4">
				Id:
				<span class="text-xs py-1 px-2 leading-none bg-blue-500 text-white rounded-md">
					{deletedContact.contactId}
				</span>
			</p>
			<p>
				Name:
				<span
					class="text-xs py-1 px-2 leading-none dark:bg-gray-900 rounded-md bg-green-100 text-green-600"
				>
					{deletedContact.contactName}
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
