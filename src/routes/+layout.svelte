<script lang="ts">
    import type { LayoutData } from './$types';
    import Toasts from '$lib/components/Toasts.svelte';
    import 'iconify-icon';
    import '../app.css';
    
</script>

<Toasts />
<slot/>