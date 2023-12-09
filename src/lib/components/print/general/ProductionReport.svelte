<script lang="ts">
	import type { GetDailyProductionReport } from '$lib/trpc/routes/reports/reports.drizzle';

	export let heading: string;
	export let dataResults: {
		data:  (NonNullable<GetDailyProductionReport>)['shop_orders'];
			pageNumber: number;
		};
</script>

<div class="pageLandscape text-black">
	<div class="border-b-2 border-blue-500 absolute top-0 left-0 w-full pl-10">
		<div class="flex justify-between items-center pt-6">
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
	</div>
	<div class="absolute top-[104px] left-0 ml-5 mr-20">
		<!-- List Slot -->
		{#if dataResults}
			<div class="flex justify-center w-full">
				<div class="w-full">
					<table class="w-full">
						<thead class="">
							<tr class="border border-gray-200 bg-gray-100 text-white">
								<th class="px-2 py-1 text-[0.63rem] text-black text-left">#</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-left">Job Name</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-left">Client Name</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-left">Garment Placement</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-left">Quantity</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-right">Special Instruction</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-right">Stitches</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-right">Units Done</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-right">Units Bad</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-right">Units Rem</th>
								<th class="px-2 py-1 text-[0.63rem] text-black text-right">Remarks</th>
							</tr>
						</thead>
						<tbody class="bg-white">
							{#each dataResults.data as item, index (item.orders_details_id)}
								<tr
									class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal even:bg-gray-50 odd:text-pickled-bluewood-900 even:text-pickled-bluewood-900"
								>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left"
										>{index + 1 + 10 * (dataResults.pageNumber - 1)}</td
									>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left">{item.contact_full_name}</td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left">{item.product_name}</td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left">{item.order_details_garment_placement}</td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left">
										{item.order_details_quantity}
									</td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left"></td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left">{item.product_stitches}</td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left"></td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left"></td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left"></td>
									<td class="px-2 py-1 text-[0.63rem] text-black text-left"></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
	<div class="footer border-t-2 border-blue-500 mb-10">
		<div class="p-4 text-xs mx-auto">
			<p>
				Page {dataResults.pageNumber}
			</p>
		</div>
	</div>
</div>
