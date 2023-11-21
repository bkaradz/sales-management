<script lang="ts">
	import small_logo from '$lib/assets/small_logo.png';

</script>

<!-- <div id="receipt" class="receipt">
	<div class="header flex flex-col">
		<div class="flex justify-between items-center">
			<div class="w-1/3">
				<img src={small_logo} alt="logo" class="w-48 mx-auto" />
			</div>
			<div class="p-2 w-2/3">
				<ul class="flex">
					<li class="flex flex-col p-2 border-l-2 border-royal-blue-200">
						<p class="text-xs">Lillian Enterprises (Pvt) Ltd t/a</p>
						<p class="text-xs"><b>The Embroidery Shop</b></p>
						<p class="text-xs">Stanfield Ratcliffe Building</p>
						<p class="text-xs">126 J Moyo St & 13th Ave</p>
						<p class="text-xs">Bulawayo</p>
					</li>
				</ul>
			</div>
		</div>
		<div class="w-full h-0.5 bg-royal-blue-500 absolute top-[115px] right-0" />
	</div>
	<div>
		{#if order}
			<slot />
			<div class="flex justify-center py-4">
				<div class="w-full">
					<table class="w-full">
						<thead class="">
							<tr class="border border-pickled-bluewood-300 text-white">
								<th class="px-1 py-1 text-xs text-pickled-bluewood-500 text-left">#</th>
								<th class="px-1 py-1 text-xs text-pickled-bluewood-500 text-left">Product</th>
								<th class="px-1 py-1 text-xs text-pickled-bluewood-500 text-right">Qty</th>
								<th class="px-1 py-1 text-xs text-pickled-bluewood-500 text-right">Price</th>
								<th class="px-1 py-1 text-xs text-pickled-bluewood-500 text-right">Total</th>
							</tr>
						</thead>
						<tbody class="bg-white">
							{#each order.OrderLine as item (item.id)}
								{@const totalPrice = multiply(dinero(item.unitPrice), item.quantity)}
								<tr
									class="whitespace-no-wrap w-full border border-t-0 border-pickled-bluewood-300 font-normal"
								>
									<td class="px-1 py-1 text-xs text-pickled-bluewood-500 text-left"
										>{item.productsID}</td
									>
									<td class="px-1 py-1">
										<div class="text-[10px] text-pickled-bluewood-600">
											{item?.Products?.name}
										</div>
									</td>
									<td class="px-1 py-1">
										<div class="text-xs text-pickled-bluewood-500 text-right">
											{item?.quantity}
										</div>
									</td>
									<td class="px-1 py-1 text-xs text-pickled-bluewood-500 text-right truncate"
										>{format(dinero(item.unitPrice))}
									</td>
									<td
										class="px-1 py-1 text-xs text-pickled-bluewood-500 font-semibold text-right truncate"
									>
										{format(totalPrice)}
									</td>
								</tr>
							{/each}
							{#if true}
								<tr class="">
									<td colspan="3" />
									<td class="text-xs font-bold px-1">Subtotal</td>
									<td class="text-xs font-bold tracking-wider text-right px-1 py-1"
										>{format(subTotal)}</td
									>
								</tr>
								<tr>
									<th colspan="3" />
									<td class="text-xs font-bold px-1"><b>VAT({vat}%)</b></td>
									<td class="text-xs font-bold text-right px-1 py-1">{format(calculatedVat)}</td>
								</tr>
								<tr class="text-pickled-bluewood-800">
									<th colspan="3" />
									<td class="text-xs font-bold border border-r-0 border-royal-blue-700 px-1"
										><b>Total</b></td
									>
									<td
										class="text-xs font-bold text-right px-1 py-1 border border-l-0 border-royal-blue-700"
										>{format(calculatedTotal)}</td
									>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
	<div class="receipt_footer">
		<div class="w-full h-0.5 bg-royal-blue-500 absolute bottom-[20px] right-0" />
		<div class="mb-5">
			<div class="flex items-center justify-center text-xs">
				Thank you very much for doing business with us.
			</div>
		</div>
	</div>
</div> -->
