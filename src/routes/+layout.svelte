<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<header>
	<nav class="bg-gray-secondary flex w-[100vw] items-end justify-between p-4 text-white">
		<a href="/" class="text-2xl font-bold">SmartHome</a>
		<a href="?admin=true" class="text-2xl font-bold">Admin</a>
	</nav>
</header>

{@render children()}
