<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;

	export let form: ActionData;

	$: if (form?.success) {
		invalidateAll();
		toasts.add({
			message: 'Contact edited successfully',
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
	<title>Edit Contact</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
		<div
			class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
		>
			<div class="flex w-full items-center">
				<div class="flex items-center text-3xl text-gray-900 dark:text-white">Edit Contact</div>
				<div class="ml-auto sm:flex hidden items-center justify-end">
					<!--  -->
				</div>
			</div>
		</div>

		<div
			class="px-4 md:px-0 lg:w-6/12 bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 m-auto"
		>
			<div class="md:mx-6 md:p-12">
				<div class="text-center">
					<h4 class="mb-6 pb-1 text-xl font-semibold">Please edit the Contact</h4>
				</div>

				{#if data.results}
					<form method="POST" action="?/update" use:enhance>
						<input hidden type="number" name="id" id="id" value={data.results.id} />
						<!--Username input-->
						<div class="relative mb-4">
							<input
								type="text"
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="fullName"
								name="fullName"
								placeholder="Full Name"
								bind:value={data.results.fullName}
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
								<input
									name="isCorporate"
									type="checkbox"
									bind:checked={data.results.isCorporate}
								/>
								{#if data.results.isCorporate}
									<span class="text-neutral-500 ml-2">Corporate</span>
								{:else}
									<span class="text-neutral-500 ml-2">Individual</span>
								{/if}
							</label>
						</div>

						{#if data.results.isCorporate}
							<!--Vat No or Bp Number-->
							<div class="relative mb-4">
								<input
									type="text"
									class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
									id="vatOrBpNumber"
									name="vatOrBpNumber"
									placeholder="Vat No or Bp Number"
									bind:value={data.results.vatOrBpNumber}
								/>
								<label
									for="vatOrBpNumber"
									class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
									>Vat No or Bp Number
								</label>
							</div>
						{/if}

						<!--Email input-->
						<div class="relative mb-4">
							<input
								type="text"
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="email"
								name="email"
								placeholder="Email"
								value={data.results.emails}
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
								value={data.results.phones}
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
								value={data.results.address}
							/>
							<label
								for="address"
								class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
								>Address
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
				{/if}
			</div>
		</div>
	</div>
</div>
