<script lang="ts">
	let {
		min = 0,
		current = 10,
		max = 30,
		format = '°C',
		min_color = '#1377fa',
		max_color = '#b90000'
	}: {
		min?: number;
		current: number;
		max?: number;
		format?: string;
		min_color?: string;
		max_color?: string;
	} = $props();

	let percent = $derived(Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100)));
</script>

<div
	class="container"
	style="--percent: {percent}; --min_color: {min_color}; --max_color: {max_color};"
>
	<div class="gauge">
		<h1>{current + '' + format}</h1>
	</div>
</div>

<style>
	.container {
		--min_color: #1377fa;
		--max_color: #b90000;
		--percent: 50%;
		--deg: calc(var(--percent) * 1.8deg);
		--thickness: 1rem;
		--gauge-color: #000;
		min-height: 100px;
		width: min-content;
		display: grid;
		place-items: center;
	}

	.gauge {
		width: 6rem;
		height: 6rem;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	.gauge::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 6rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background-image:
			radial-gradient(
				closest-side,
				var(--color-gray-secondary) 0%,
				var(--color-gray-secondary) calc(100% - var(--thickness)),
				transparent calc(100% - var(--thickness))
			),
			conic-gradient(
				from -90deg,
				transparent calc(var(--deg) - 3deg),
				var(--color-gray-secondary) calc(var(--deg) - 1.5deg),
				white var(--deg),
				var(--color-gray-secondary) calc(var(--deg) + 1.5deg),
				transparent calc(var(--deg) + 3deg)
			),
			conic-gradient(from -90deg, var(--min_color) 0deg, var(--max_color) 180deg),
			conic-gradient(from -90deg, transparent var(--deg), var(--color-gray-secondary) var(--deg) 180deg);
	}

	.gauge h1 {
		position: relative;
		margin: 0;
		padding: 2rem 0 0 0;
	}
</style>
