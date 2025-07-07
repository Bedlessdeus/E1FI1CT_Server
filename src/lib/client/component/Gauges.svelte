<script lang="ts">
	import Gauge from './Gauge.svelte';

	let { gauges }: { gauges: { min?: number; current: number; max?: number; format?: string; min_color?: string; max_color?: string; }[] } =
		$props();
</script>

<div class="flex flex-row justify-between w-full">
	{#each gauges as gauge}
		<Gauge min={gauge.min} current={gauge.current} max={gauge.max} format={gauge.format} min_color={gauge.min_color} max_color={gauge.max_color}/>
	{/each}
</div>