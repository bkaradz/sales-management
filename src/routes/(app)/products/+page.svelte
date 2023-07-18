<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<form use:enhance method="post">
	<button class="p-4 bg-red-700 btn-block" type="submit">Sign out</button>
</form>