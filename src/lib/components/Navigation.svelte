<script lang="ts">
	import { page } from '$app/stores';

	$: currentPath = $page.url.pathname;
</script>

<nav
	class="bg-bg-primary dark:bg-bg-secondary-dark fixed z-20 h-full w-64 border-r border-gray-200 dark:border-gray-700"
>
	<div class="p-4">
		<div class="mb-8">
			<h1 class="text-text-primary dark:text-text-primary-dark text-2xl font-bold">Twated</h1>
		</div>

		<nav class="space-y-2">
			<a
				href="/"
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors
					{currentPath === '/'
					? 'bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark'
					: 'text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800'}"
			>
				<span class="text-xl">🏠</span>
				<span class="font-medium">Home</span>
			</a>

			<a
				href="/account"
				class="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors
					{currentPath === '/account'
					? 'bg-accent/10 dark:bg-accent-dark/10 text-accent dark:text-accent-dark'
					: 'text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800'}"
			>
				<span class="text-xl">👤</span>
				<span class="font-medium">Profile</span>
			</a>
		</nav>
	</div>
</nav>
