<script lang="ts">
	import { enhance } from '$app/forms';

	export let form;
	let old_request_controller:AbortController;
</script>

<form method="POST" use:enhance={({controller})=>{
	old_request_controller?.abort();
	old_request_controller = controller;
}} >
	<input autocomplete="off" value={form?.search ?? ""} name="search" /><button type="submit">search</button>
</form>
{#if form?.posts}
	<ul>
		{#each form.posts as post (post.id)}
			<li>{post.title}</li>
		{/each}
	</ul>
{/if}
