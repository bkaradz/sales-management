<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { svgDropdown } from '$lib/assets/svgLogos';
	import {
		enteredAmountStore,
		enteredAmountValue,
		exchangeRatesStore,
		selectedProductCategoryStore,
		selectedCurrencyStore
	} from '$lib/stores/cartStore';
	import { toasts } from '$lib/stores/toasts.store.js';
	import { format } from '$lib/utility/calculateCart.util';
	import { convertFx } from '$lib/utility/currencyConvertor.util';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { productCategories } from '$lib/utility/lists.utility.js';
	import { onMount } from 'svelte';

	const changeEnteredAmountStore = (e: Event) => {
		const target = e.target as HTMLInputElement;
		enteredAmountStore.add(target.value);
	};

	onMount(() => {
		enteredAmountStore.reset();
		selectedProductCategoryStore.reset();
	});

	let doubleClicked = false;

	export let form;

	$: if (form?.success) {
		enteredAmountStore.reset();
		selectedProductCategoryStore.reset();
		toasts.add({
			message: 'Product created successfully',
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
	<title>Create Product</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
		<div
			class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
		>
			<div class="flex w-full items-center">
				<div class="flex items-center text-3xl text-gray-900 dark:text-white">Create Product</div>
				<div class="ml-auto sm:flex hidden items-center justify-end">
					<form class="flex" action="?/upload" method="post" enctype="multipart/form-data">
						<input
							type="file"
							name="products"
							accept=".csv"
							class="mb-2 file-input rounded-md file-input-bordered file-input-sm w-full max-w-xs bg-blue-500 text-white"
						/>
						<button type="submit" class="h-8 px-3 ml-2 rounded-md shadow text-white bg-blue-500"
							>Upload</button
						>
					</form>
				</div>
			</div>
		</div>

		<div
			class="px-4 md:px-0 lg:w-6/12 bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 m-auto"
		>
			<div class="md:mx-6 md:p-12">
				<div class="text-center">
					<h4 class="mb-6 pb-1 text-xl font-semibold">Please Create a Product</h4>
				</div>

				<form method="POST" action="?/create" use:enhance>
					<!--Product Name input-->
					<div class="relative mb-4">
						<input
							type="text"
							class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
							id="name"
							name="name"
							placeholder="Name"
						/>
						<label
							for="name"
							class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
							>Name
						</label>
					</div>

					<div class="mb-4">
						<input
							hidden
							name="productCategory"
							type="text"
							value={$selectedProductCategoryStore}
						/>
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<div class="dropdown w-64">
							<label
								tabindex="0"
								class="flex items-center h-8 px-3 rounded shadow text-white bg-blue-500 hover:bg-blue-400 w-full justify-between"
							>
								<span class="ml-2">{$selectedProductCategoryStore}</span>
								{@html svgDropdown}
							</label>
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<ul
								tabindex="0"
								class="dropdown-content menu z-[1] p-2 shadow bg-gray-50 dark:bg-gray-800 rounded-sm w-52 mt-4"
							>
								{#each productCategories as category (category)}
									{#if !(category === $selectedProductCategoryStore)}
										<li>
											<button
												on:click={() => selectedProductCategoryStore.add(category)}
												class="rounded-sm"
											>
												{category}
											</button>
										</li>
									{/if}
								{/each}
							</ul>
						</div>
					</div>

					{#if $selectedProductCategoryStore === 'Embroidery'}
						<!--Stitches input-->
						<div class="relative mb-4">
							<input
								type="number"
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="stitches"
								name="stitches"
								placeholder="Stitches"
							/>
							<label
								for="stitches"
								class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
								>Stitches
							</label>
						</div>
					{/if}

					{#if $selectedProductCategoryStore !== 'Embroidery'}
						<!--Stitches input-->
						<div class="mb-4">
							<!-- <div class="grid grid-cols-2"> -->
							{#if doubleClicked}
								<div class="relative">
									<input
										on:blur={() => (doubleClicked = false)}
										class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
										id="enter_unitPrice"
										name="enter_unitPrice"
										type="number"
										min="1"
										step=".01"
										placeholder="Enter Unit Price"
										value={$enteredAmountStore}
										use:selectTextOnFocus
										on:change|preventDefault={(e) => changeEnteredAmountStore(e)}
										on:input|preventDefault={(e) => changeEnteredAmountStore(e)}
									/>
									<label
										for="enter_unitPrice"
										class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
										>Enter Unit Price
									</label>
								</div>
							{:else}
								<div class="relative">
									<input
										disabled
										on:dblclick={() => (doubleClicked = true)}
										type="text"
										class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
										id="unitPrice_label"
										name="unitPrice_label"
										value={format(
											convertFx($enteredAmountValue, $exchangeRatesStore, $selectedCurrencyStore),
											$selectedCurrencyStore
										)}
										placeholder="Unit Price"
									/>
									<input
										hidden
										type="text"
										id="productUnitPrice"
										name="productUnitPrice"
										value={$enteredAmountValue}
									/>
									<label
										for="unitPrice_label"
										class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
										>Unit Price
									</label>
								</div>
							{/if}
							<!-- </div> -->
						</div>

						<div class="relative mb-4">
							<input
								type="number"
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="storkQuantity"
								name="storkQuantity"
								placeholder="Stork Quantity"
							/>
							<label
								for="storkQuantity"
								class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
								>Quantity
							</label>
						</div>
					{/if}

					<!--Description input-->
					<div class="relative mb-4">
						<textarea
							class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
							id="description"
							rows="4"
							name="description"
							placeholder="Description"
						/>
						<label
							for="description"
							class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
							>Description
						</label>
					</div>

					<!--Submit button-->
					<div class="mb-12 pb-1 pt-1 text-center">
						<button
							class="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
							type="submit"
							data-te-ripple-init
							data-te-ripple-color="light"
							style="background: linear-gradient(to right, #06b6d4, #3b82f6)"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
