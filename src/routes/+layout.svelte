<script lang="ts">
	import { redirect } from '@sveltejs/kit';
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { children, data } = $props();

	let adminState = $state(page.route.id === '/admin');

	const toggleAdmin = () => {
		adminState = !adminState;
		goto(adminState ? '/admin' : '/');
	}
</script>

<header>
	<nav class="bg-gray-secondary flex w-[100vw] items-end justify-between p-4 text-white">
		<a href="/" class="text-2xl font-bold">SmartHome</a>
		<button onclick={toggleAdmin} class="text-2xl font-bold">{adminState ? 'Admin' : 'User'}</button>
	</nav>
</header>

{@render children()}
