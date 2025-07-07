<script lang="ts">
	import Gauges from './Gauges.svelte';

	let {
		device
	}: { device: { device_id: string; device_name: string; last_temp: number; last_humid: number } } =
		$props();
</script>

<a class="bg-gray-secondary rounded-[5px] p-4 text-white" href={`/sensor/${device.device_id}`}>
	<div class="flex items-center justify-between p-4">
		<Gauges gauges={[{ current: device.last_temp }, { current: device.last_humid }]} />
	</div>
	<div class="font-bold">{device.device_name}</div>
</a>
