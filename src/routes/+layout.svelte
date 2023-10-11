<script lang="ts">
    import { setContext } from 'svelte';
    import type { LayoutData } from './$types';
    import Toasts from '$lib/components/Toasts.svelte';
    import '../app.css';
	import { writable } from 'svelte/store';

    export let data: LayoutData
    $: console.log("🚀 ~ file: +layout.svelte:10 ~ data:", data)

    // setContext('localization', writable(data.pricelists))
    
</script>

<Toasts />
<slot/>