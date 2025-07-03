<script lang="ts">
	import '../app.css';

	let { children, data } = $props();

	let adminState = $state(data.isAdmin);

	const toggleAdmin = () => {
		fetch("/api/user/admin/state", {
			method: "POST",
			body: JSON.stringify({ state: !adminState }),
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => response.json())
			.then(data => {
				adminState = data.state;
			})
			.catch(error => console.error("Error:", error));
	}
</script>

<header>
	<nav class="bg-gray-secondary flex w-[100vw] items-end justify-between p-4 text-white">
		<a href="/" class="text-2xl font-bold">SmartHome</a>
		<button onclick={toggleAdmin} class="text-2xl font-bold">{adminState ? 'User' : 'Admin'}</button>
	</nav>
</header>

{@render children()}
