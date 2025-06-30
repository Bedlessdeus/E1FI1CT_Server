<script>
	//import TempBar from "$lib/client/comp/TempBar.svelte";

	export let data;
</script>

<div class="grid grid-cols-3 gap-4 p-8">
	{#each data.items as item}
		<a class="device" href={`/article/${item.id}`}>
			<!--<TempBar current_temp={Math.round(Math.random() * 100)}/>-->
			<div class="font-bold">{item.title}</div>
			<div>{item.description}</div>
		</a>
	{/each}
</div>