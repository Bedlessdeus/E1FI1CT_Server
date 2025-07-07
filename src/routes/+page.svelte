<script>
	import SensorView from '$lib/client/component/SensorView.svelte';

	export let data;
</script>

<div class="grid grid-cols-3 gap-4 p-8">
	{#each data.devices as device}
		<SensorView {device} />
	{/each}
</div>
