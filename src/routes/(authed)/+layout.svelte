<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<div class="bg-bg-secondary dark:bg-bg-primary-dark flex min-h-screen">
	<Navigation />
	<main class="ml-64 flex-1">
		{@render children()}
	</main>
</div>
