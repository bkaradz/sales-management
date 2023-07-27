<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: console.log('🚀 ~ file: +page.svelte:5 ~ data:', data);
</script>

<div
	class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-5"
>
	<div class="text-xs text-gray-400 tracking-wider uppercase">Contacts</div>

	<div class="overflow-x-auto bg-white mt-2">
		<table class="table table-xs">
			<thead>
				<tr>
					<th>Id</th>
					<th>Name</th>
					<th>Phone</th>
					<th>Address</th>
					<th>location</th>
					<th>Last Login</th>
					<th>Favorite Color</th>
				</tr>
			</thead>
			<tbody>
				{#each data.contacts.results as contacts (contacts.id)}
					<tr>
						<th>{contacts.id}</th>
						<td>{contacts.name}</td>
						<td>{contacts?.phone[0]?.phone}</td>
						<td>{contacts?.address[0]?.address}</td>
						<td>Canada</td>
						<td>12/16/2020</td>
						<td>Blue</td>
					</tr>
				{/each}
			</tbody>
			<!-- <tfoot>
				<tr>
					<th />
					<th>Name</th>
					<th>Job</th>
					<th>company</th>
					<th>location</th>
					<th>Last Login</th>
					<th>Favorite Color</th>
				</tr>
			</tfoot> -->
		</table>

		<div class="join rounded-none">
			<button class="join-item btn btn-sm">1</button>
			<button class="join-item btn btn-sm">2</button>
			<button class="join-item btn btn-sm btn-disabled">...</button>
			<button class="join-item btn btn-sm">99</button>
			<button class="join-item btn btn-sm">100</button>
		</div>
	</div>
</div>
