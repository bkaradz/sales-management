<script lang="ts">
	import {
		svgDashboardCart,
		svgDashboardCashFlow,
		svgDashboardMessages,
		svgDashboardOrders,
		svgDashboardUser
	} from '$lib/assets/svgLogos';
	import { activitiesTabs } from '$lib/data/tabsData';
	import { exchangeRatesStore } from '$lib/stores/cartStore';
	import fx from 'money';

	let rates = {};

	$exchangeRatesStore.exchange_rate_details.forEach((value, key) => {
		rates = { ...rates, [key]: value.rate };
	});

	fx.base = 'USD';
	fx.rates = rates;

	fx.settings = { from: 'ZAR', to: 'USD' };
	// $: console.log("object", fx.convert('1000'));

	$: console.log('to rand', fx.convert('1000', { to: 'ZAR' }));
	$: console.log('FROM rand TO USD', fx.convert('1000', { from: 'ZAR', to: 'USD' }));
	$: console.log('FROM PULA TO RAND', fx.convert('1000', { from: 'BWP', to: 'ZAR' }));
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex-grow flex overflow-x-hidden">
	<!-- User Table -->
	<div class="flex-grow dark:bg-gray-900 overflow-y-auto">
		<div
			class="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0"
		>
			<div class="flex w-full items-center">
				<div class="flex items-center text-3xl text-gray-900 dark:text-white">Dashboard</div>
			</div>
			<div class="flex items-center space-x-3 sm:mt-7 mt-4">
				{#each activitiesTabs as activity, index (activity.id)}
					<button
						class={`px-3 border-b-2 pb-1.5 ${
							activity.selected
								? 'border-blue-500 text-blue-500 dark:text-white dark:border-white'
								: 'border-transparent text-gray-600 dark:text-gray-400'
						} ${index > 1 ? 'sm:block hidden' : ''}`}
					>
						{activity.name}
					</button>
				{/each}
			</div>
		</div>
		<div class="container px-6 mx-auto grid">
			<!-- Cards -->
			<div class="grid gap-6 mt-8 md:grid-cols-2 xl:grid-cols-4">
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-green-500 bg-green-100 rounded-full dark:text-green-100 dark:bg-green-500"
					>
						{@html svgDashboardOrders}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Income Today</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">6389</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-red-500 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-500"
					>
						{@html svgDashboardCashFlow}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Expenses Today</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">$ 46,760.89</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500"
					>
						{@html svgDashboardCart}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Today sales</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">376</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-teal-500 bg-teal-100 rounded-full dark:text-teal-100 dark:bg-teal-500"
					>
						{@html svgDashboardMessages}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
							Pending contacts
						</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">35</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-green-500 bg-green-100 rounded-full dark:text-green-100 dark:bg-green-500"
					>
						{@html svgDashboardOrders}
					</div>

					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
							Income this Month
						</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">6389</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-red-500 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-500"
					>
						{@html svgDashboardCashFlow}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
							Expenses this Month
						</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">$ 46,760.89</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500"
					>
						{@html svgDashboardCart}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Monthly sales</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">376</p>
					</div>
				</div>
				<!-- Card -->
				<div class="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<div
						class="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500"
					>
						{@html svgDashboardUser}
					</div>
					<div>
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
							Pending contacts
						</p>
						<p class="text-lg font-semibold text-gray-700 dark:text-gray-200">35</p>
					</div>
				</div>
			</div>

			<!-- Charts -->
			<h2 class="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Charts</h2>
			<div class="grid gap-6 mb-8 md:grid-cols-2">
				<!-- Card -->
				<div class="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<h4 class="mb-4 font-semibold text-gray-800 dark:text-gray-300">Revenue</h4>
					<canvas id="pie" />
					<div class="flex justify-center mt-4 space-x-3 text-sm text-gray-600 dark:text-gray-400">
						<!-- Chart legend -->
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-blue-500 rounded-full" />
							<span>Shirts</span>
						</div>
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-teal-600 rounded-full" />
							<span>Shoes</span>
						</div>
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-purple-600 rounded-full" />
							<span>Bags</span>
						</div>
					</div>
				</div>
				<!-- Card -->
				<div class="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<h4 class="mb-4 font-semibold text-gray-800 dark:text-gray-300">Traffic</h4>
					<canvas id="line" />
					<div class="flex justify-center mt-4 space-x-3 text-sm text-gray-600 dark:text-gray-400">
						<!-- Chart legend -->
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-teal-600 rounded-full" />
							<span>Organic</span>
						</div>
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-purple-600 rounded-full" />
							<span>Paid</span>
						</div>
					</div>
				</div>
				<!-- Card -->
				<div class="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<h4 class="mb-4 font-semibold text-gray-800 dark:text-gray-300">Revenue</h4>
					<canvas id="pie" />
					<div class="flex justify-center mt-4 space-x-3 text-sm text-gray-600 dark:text-gray-400">
						<!-- Chart legend -->
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-blue-500 rounded-full" />
							<span>Shirts</span>
						</div>
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-teal-600 rounded-full" />
							<span>Shoes</span>
						</div>
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-purple-600 rounded-full" />
							<span>Bags</span>
						</div>
					</div>
				</div>
				<!-- Card -->
				<div class="min-w-0 p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
					<h4 class="mb-4 font-semibold text-gray-800 dark:text-gray-300">Traffic</h4>
					<canvas id="line" />
					<div class="flex justify-center mt-4 space-x-3 text-sm text-gray-600 dark:text-gray-400">
						<!-- Chart legend -->
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-teal-600 rounded-full" />
							<span>Organic</span>
						</div>
						<div class="flex items-center">
							<span class="inline-block w-3 h-3 mr-1 bg-purple-600 rounded-full" />
							<span>Paid</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
