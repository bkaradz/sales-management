<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import type { LayoutData } from './$types';
    import Toasts from '$lib/components/Toasts.svelte';
    import '../app.css';
	import { pricelist } from '$lib/stores/cartStore';
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';

    export let data: LayoutData

    $:  pricelist.add(data.pricelists)

</script>

<Toasts />
<slot/>