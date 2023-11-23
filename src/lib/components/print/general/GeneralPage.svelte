<script lang="ts">
	import { exchangeRatesStore, selectedRateStore } from '$lib/stores/cartStore';
	import type { GetProductionOrders } from '$lib/trpc/routes/orders/orders.drizzle';
	import type { GetSalesReports } from '$lib/trpc/routes/reports/reports.drizzle';
	import { dollars, format } from '$lib/utility/calculateCart.util';
	import { converter } from '$lib/utility/currencyConvertor.util';
	import { dinero, multiply, toSnapshot } from 'dinero.js';

	export let heading: string;
	export let data: { results: GetSalesReports };
</script>

<div class="page text-black">
	<div class="border-b-2 border-blue-500 absolute top-0 left-0 w-full pl-10">
		<div class="flex justify-between items-center pt-10">
			<div class="w-1/3">
				<h1 class="text-2xl font-semibold text-center">{heading}</h1>
			</div>
			<div class="p-2 w-2/3">
				<ul class="flex">
					<li class="flex flex-col items-center p-2 border-l-2 border-gray-200">
						<p class="text-xs italic">www.theembroideryshop.co.zw</p>
						<p class="text-xs italic">theembroideryshopzw@gmail.com</p>
					</li>
					<li class="flex flex-col p-2 border-l-2 border-gray-200">
						<p class="text-xs">Lillian Enterprises (Pvt) Ltd t/a</p>
						<p class="text-xs"><b>The Embroidery Shop</b></p>
					</li>
				</ul>
			</div>
		</div>
		<!-- <div class="w-full h-0.5 bg-blue-500 absolute top-[178px] right-0" /> -->
	</div>
	<div class="absolute top-[104px] left-0 m-10">
		<!-- List Slot -->
		{#if data?.results}
			<div class="flex justify-center w-full">
				<div class="w-full">
					<table class="w-full">
						<thead class="">
							<tr class="border border-gray-200 bg-gray-100 text-white">
								<th class="px-4 py-2 text-xs text-black text-left"> # </th>
								<th class="px-4 py-2 text-xs text-black text-left"> Id </th>
								<th class="px-4 py-2 text-xs text-black text-left"> Customer Name </th>
								<th class="px-4 py-2 text-xs text-black text-left"> Product Name </th>
								<th class="px-4 py-2 text-xs text-black text-left"> Product Category </th>
								<th class="px-4 py-2 text-xs text-black text-right"> Quantity </th>
								<th class="px-4 py-2 text-xs text-black text-right"> Unit Price </th>
								<th class="px-4 py-2 text-xs text-black text-right"> Total </th>
								<th class="px-4 py-2 text-xs text-black text-right"> Payment </th>
							</tr>
						</thead>
						<tbody class="bg-white">
							{#each data.results.orders as item, index (item.orders_details.id)}
								<tr
									class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal even:bg-gray-50 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
								>
									<td class="px-4 py-2 text-xs text-black text-left">{index + 1}</td>
									<td class="px-4 py-2 text-xs text-black text-left">{item.orders_details.id}</td>
									<td class="px-4 py-2 text-xs text-black text-left">{item.contacts.full_name}</td>
									<td class="px-4 py-2 text-xs text-black text-left">{item.products.name}</td>
									<td class="px-4 py-2 text-xs text-black text-left">{item.products.product_category}</td>
									<td class="px-4 py-2 text-xs text-black text-left">{item.orders_details.quantity}</td>
									<td class="px-4 py-2 text-xs text-black text-right truncate">
										{format(
											converter(dinero(item.orders_details.unit_price), $selectedRateStore, $exchangeRatesStore)
										)}
									</td>
									<td class="px-4 py-2 text-xs text-black font-semibold text-right truncate">
										{format(
											converter(multiply(dinero(item.orders_details.unit_price), { amount: item.orders_details.quantity * 1000, scale: 3 }), $selectedRateStore, $exchangeRatesStore)
										)}
									</td>
									<td class="px-4 py-2 text-xs text-black text-left">{item.orders.payment_status}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
	<div class="footer border-t-2 border-blue-500 mb-10">
		<div class="p-4 text-lg mx-auto">
			<p>
				Page {2}
			</p>
		</div>
	</div>
</div>
