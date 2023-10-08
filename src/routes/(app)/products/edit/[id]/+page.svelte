<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.results?.product}
	<div class="flex-grow flex overflow-x-hidden">
		<div class="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
			<div
				class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
			>
				<div class="flex w-full items-center">
					<div class="flex items-center text-3xl text-gray-900 dark:text-white">Update Product</div>
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
						<h4 class="mb-6 pb-1 text-xl font-semibold">Please edit the Product</h4>
					</div>

					<form method="POST" action="?/update" use:enhance>
						<input hidden type="number" name="id" id="id" value={data.results.product.id} />

						<!--Product Name input-->
						<div class="relative mb-4">
							<input
								type="text"
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="name"
								name="name"
								placeholder="Name"
								bind:value={data.results.product.name}
							/>
							<label
								for="name"
								class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
								>Name
							</label>
						</div>

						<!--Description input-->
						<div class="relative mb-4">
							<textarea
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="description"
								rows="4"
								name="description"
								placeholder="Description"
								bind:value={data.results.product.description}
							/>
							<label
								for="description"
								class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
								>Description
							</label>
						</div>

						<!--Stitches input-->
						<div class="relative mb-4">
							<input
								type="number"
								class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear placeholder-transparent"
								id="stitches"
								name="stitches"
								placeholder="Stitches"
								bind:value={data.results.product.stitches}
							/>
							<label
								for="stitches"
								class="pointer-events-none absolute left-3 top-0 -translate-y-[0.9rem] scale-[0.8] origin-[0_0] mb-0 max-w-[90%] pt-[0.37rem] leading-[1.6] truncate text-neutral-500 transition-all duration-200 ease-out dark:text-neutral-200 motion-reduce:transition-none peer-placeholder-shown:scale-[1] peer-placeholder-shown:pt-[1] peer-placeholder-shown:top-3.5 peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:left-3 peer-focus:top-0"
								>Stitches
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
{/if}
