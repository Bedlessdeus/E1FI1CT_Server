<script>
	import SensorView from '$lib/client/component/SensorView.svelte';

	export let data;
</script>

<div class="grid grid-cols-3 gap-4 p-8">
	{#each data.devices as device}
		<SensorView {device} />
	{/each}
		<a
			class="bg-gray-secondary rounded-[5px] p-4 text-white"
			href={`/sensor/new`}
			aria-label="Add new sensor"
		>
			<div class="flex items-center justify-center p-4">
				<svg class="h-1/2 w-1/2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M4 12H20M12 4V20"
						stroke="#FFF"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		</a>
</div>
