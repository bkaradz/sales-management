<script lang="ts">
	import small_logo from '$lib/assets/logo.png';

</script>

<div class="page text-black">
	<div class="border-b-2 border-blue-500 absolute top-0 left-0 w-full pl-10">
		<div class="flex justify-between items-center">
			<div class="w-1/3">
				<img src={small_logo} alt="logo" class="w-48 mx-auto" />
			</div>
			<div class="p-2 w-2/3">
				<ul class="flex">
					<li class="flex flex-col items-center p-2 border-l-2 border-gray-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
							/>
						</svg>
						<p class="text-xs italic">www.theembroideryshop.co.zw</p>
						<p class="text-xs italic">theembroideryshopzw@gmail.com</p>
					</li>
					<li class="flex flex-col p-2 border-l-2 border-gray-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<p class="text-xs">Lillian Enterprises (Pvt) Ltd t/a</p>
						<p class="text-xs"><b>The Embroidery Shop</b></p>
						<p class="text-xs">Stanfield Ratcliffe Building</p>
						<p class="text-xs">126 J Moyo St & 13th Ave</p>
						<p class="text-xs">Bulawayo</p>
					</li>
				</ul>
			</div>
		</div>
		<!-- <div class="w-full h-0.5 bg-blue-500 absolute top-[178px] right-0" /> -->
	</div>
	<div class="absolute top-36 left-0">
		<!-- List Slot -->
		<h1>Test</h1>
	</div>
	<div class="footer border-t-2 border-blue-500 mb-10">

		<div class="flex justify-between px-10 pt-2">
			<div>
				<h3 class="text-sm">Banking Details :</h3>
				<ul class="text-xs list-disc list-inside">
					<li>Account Name: <span>Lillian Enterprises P/L</span></li>
					<li>Account No: <span>21301 12883255602015</span></li>
					<li>Bank: <span>Banc ABC</span></li>
					<li>Branch: <span>J Moyo</span></li>
				</ul>
			</div>
			<div class="p-1 text-sm">
				{2}
			</div>
		</div>

		<div class="">
			<div class="flex items-center justify-center text-xs">
				Thank you very much for doing business with us.
			</div>
		</div>
	</div>
</div>
