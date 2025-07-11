<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import type { LayoutData } from './$types';
	
	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<div class="flex min-h-screen bg-bg-secondary dark:bg-bg-primary-dark">
	<Navigation />
	<main class="flex-1 ml-64">
		{@render children()}
	</main>
</div>
