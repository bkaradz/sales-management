<script lang="ts">
    import { setContext } from 'svelte';
    import type { LayoutData } from './$types';
    import Toasts from '$lib/components/Toasts.svelte';
    import '../app.css';
	import { pricelist } from '$lib/stores/cartStore';

    export let data: LayoutData

    pricelist.add(data.pricelists)
    // setContext('localization', writable(data.pricelists))
    
</script>

<Toasts />
<slot/>