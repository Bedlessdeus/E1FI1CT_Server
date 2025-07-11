<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';

	let { form }: { form: ActionData } = $props();

	let action: 'login' | 'register' = $state(page.params.page) as 'login' | 'register';

	/*
	 * Form validation
	 */
	let username = $state(''),
		password = $state(''),
		tos = $state(false);
	let isValidUsername = $derived(username.trim().length >= 3),
		isValidPassword = $derived(password.length >= 8),
		isFormValid = $derived(isValidUsername && isValidPassword && tos);

	/*
	 * Fancy unnecessary subtitle animation
	 * Yes, it's 2 am and I wanted to do something fancy
	 */
	let displayedSubtitle = $state('');
	let showCursor = $state(true);

	const fullSubtitle = 'Welcome back';

	onMount(() => {
		let subtitleIndex = 0;
		const subtitleInterval = setInterval(() => {
			if (subtitleIndex < fullSubtitle.length) {
				displayedSubtitle += fullSubtitle[subtitleIndex];
				subtitleIndex++;
			} else {
				clearInterval(subtitleInterval);
				setTimeout(() => {
					showCursor = false;
				}, 1000);
			}
		}, 100);
	});
</script>

<main
	class="bg-bg-secondary dark:bg-bg-primary-dark flex min-h-screen items-center justify-center p-4"
>
	<div class="w-full max-w-sm">
		<div class="mb-6">
			<h1 class="text-text-primary dark:text-text-primary-dark text-3xl font-bold">Twated</h1>
			<p class="text-text-secondary dark:text-text-secondary-dark mt-1">
				{displayedSubtitle}<span class="cursor" class:blink={showCursor}>|</span>
			</p>
		</div>

		<div
			class="bg-bg-primary dark:bg-bg-secondary-dark rounded-2xl border border-gray-200 p-8 shadow-xl dark:border-gray-700"
		>
			<h2
				class="text-text-primary dark:text-text-primary-dark mb-6 text-center text-2xl font-semibold"
			>
				{action.at(0)?.toUpperCase() + action.slice(1)}
			</h2>

			<form id="log-form" method="post" action="?/{action}" use:enhance class="space-y-4">
				<div>
					<label for="username"> Username </label>
					<input
						id="username"
						name="username"
						type="text"
						placeholder="Enter your username"
						autocomplete="username"
						class="w-full"
						bind:value={username}
						required
					/>
					{#if username.length > 0 && !isValidUsername}
						<p class="mt-1 text-xs text-red-500">Username must be at least 3 characters</p>
					{/if}
				</div>

				<div>
					<label for="password"> Password </label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="Enter your password"
						autocomplete="current-password"
						minlength="8"
						bind:value={password}
						required
					/>
					{#if password.length > 0 && !isValidPassword}
						<p class="mt-1 text-xs text-red-500">Password must be at least 8 characters</p>
					{/if}
				</div>
				<div>
					<label for="tos" class="!flex flex-row items-start">
						<input id="tos" name="tos" type="checkbox" bind:checked={tos} required />
						<span class="ml-2 text-sm">I agree to the Terms of Service</span>
					</label>
				</div>

				{#if form?.message}
					<div
						class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
					>
						<p class="text-sm text-red-600 dark:text-red-400">{form.message}</p>
					</div>
				{/if}

				<button type="submit" class="mt-6 w-full" disabled={!isFormValid}>
					{action.at(0)?.toUpperCase() + action.slice(1)}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-text-secondary dark:text-text-secondary-dark text-sm">
					{action === 'login' ? "Don't have an account?" : 'Already have an account?'}
				</p>
				<button
					type="button"
					onclick={() => (action = action === 'login' ? 'register' : 'login')}
					class="text-accent dark:text-accent-dark cursor-pointer border-none bg-transparent font-medium hover:underline"
				>
					{action === 'login' ? 'Create account' : 'Sign in'}
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	.cursor {
		color: currentColor;
	}

	.blink {
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
