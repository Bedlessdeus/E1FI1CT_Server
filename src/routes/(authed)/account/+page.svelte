<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Post = {
		id: string;
		content: string;
		author: string;
		createdAt: string;
		likes: number;
		comments: Comment[];
		isLiked?: boolean;
	};

	type Comment = {
		id: string;
		content: string;
		author: string;
		createdAt: string;
		postId?: string;
	};

	let activeTab = $state<'posts' | 'likes' | 'comments'>('posts');
	let userPosts: Post[] = $state([]);
	let likedPosts: Post[] = $state([]);
	let userComments: Comment[] = $state([]);
	let stats = $state({ posts: 0, likes: 0, comments: 0 });
	let isLoading = $state(true);

	async function loadUserActivity() {
		isLoading = true;

		try {
			const response = await fetch('/api/user/profile');
			if (response.ok) {
				const data = await response.json();
				userPosts = data.posts || [];
				likedPosts = data.likedPosts || [];
				userComments = data.comments || [];
				stats = data.stats || { posts: 0, likes: 0, comments: 0 };
			} else {
				console.error('Failed to load user activity');
			}
		} catch (error) {
			console.error('Error loading user activity:', error);
		} finally {
			isLoading = false;
		}
	}

	function formatTimeAgo(dateString: string) {
		const now = new Date();
		const date = new Date(dateString);
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return 'now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
		return `${Math.floor(diffInSeconds / 86400)}d`;
	}

	onMount(() => {
		loadUserActivity();
	});
</script>

<main class="bg-bg-secondary dark:bg-bg-primary-dark min-h-screen">
	<div class="mx-auto max-w-2xl">
		<header
			class="bg-bg-primary dark:bg-bg-secondary-dark sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700"
		>
			<div class="px-4 py-3">
				<h1 class="text-text-primary dark:text-text-primary-dark text-xl font-bold">Profile</h1>
			</div>
		</header>

		<div
			class="bg-bg-primary dark:bg-bg-secondary-dark border-b border-gray-200 p-6 dark:border-gray-700"
		>
			<div class="flex items-center space-x-4">
				<div
					class="bg-accent dark:bg-accent-dark flex h-16 w-16 items-center justify-center rounded-full"
				>
					<span class="text-xl font-bold text-white"
						>{data.user.username.charAt(0).toUpperCase()}</span
					>
				</div>
				<div>
					<h2 class="text-text-primary dark:text-text-primary-dark text-2xl font-bold">
						@{data.user.username}
					</h2>
					<p class="text-text-secondary dark:text-text-secondary-dark">Active member</p>
				</div>
			</div>

			<div class="mt-4 flex space-x-6">
				<div class="text-center">
					<div class="text-text-primary dark:text-text-primary-dark text-xl font-bold">
						{stats.posts}
					</div>
					<div class="text-text-secondary dark:text-text-secondary-dark text-sm">Posts</div>
				</div>
				<div class="text-center">
					<div class="text-text-primary dark:text-text-primary-dark text-xl font-bold">
						{stats.likes}
					</div>
					<div class="text-text-secondary dark:text-text-secondary-dark text-sm">Likes</div>
				</div>
				<div class="text-center">
					<div class="text-text-primary dark:text-text-primary-dark text-xl font-bold">
						{stats.comments}
					</div>
					<div class="text-text-secondary dark:text-text-secondary-dark text-sm">Comments</div>
				</div>
			</div>
		</div>

		<div
			class="bg-bg-primary dark:bg-bg-secondary-dark border-b border-gray-200 dark:border-gray-700"
		>
			<div class="flex">
				<button
					class="flex-1 px-4 py-3 text-center font-medium transition-colors
						{activeTab === 'posts'
						? 'text-accent dark:text-accent-dark border-accent dark:border-accent-dark border-b-2'
						: 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'}"
					onclick={() => (activeTab = 'posts')}
				>
					Posts
				</button>
				<button
					class="flex-1 px-4 py-3 text-center font-medium transition-colors
						{activeTab === 'likes'
						? 'text-accent dark:text-accent-dark border-accent dark:border-accent-dark border-b-2'
						: 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'}"
					onclick={() => (activeTab = 'likes')}
				>
					Likes
				</button>
				<button
					class="flex-1 px-4 py-3 text-center font-medium transition-colors
						{activeTab === 'comments'
						? 'text-accent dark:text-accent-dark border-accent dark:border-accent-dark border-b-2'
						: 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'}"
					onclick={() => (activeTab = 'comments')}
				>
					Comments
				</button>
			</div>
		</div>

		<div class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if isLoading}
				{#each Array(3) as _}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark animate-pulse p-4">
						<div class="flex space-x-3">
							<div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600"></div>
								<div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
								<div class="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
							</div>
						</div>
					</div>
				{/each}
			{:else if activeTab === 'posts'}
				{#if userPosts.length === 0}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark p-8 text-center">
						<p class="text-text-secondary dark:text-text-secondary-dark">
							No posts yet. Share your first thought!
						</p>
					</div>
				{:else}
					{#each userPosts as post}
						<article
							class="bg-bg-primary dark:bg-bg-secondary-dark p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
						>
							<div class="flex space-x-3">
								<div
									class="bg-accent dark:bg-accent-dark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
								>
									<span class="text-sm font-semibold text-white"
										>{post.author.charAt(0).toUpperCase()}</span
									>
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center space-x-2">
										<span class="text-text-primary dark:text-text-primary-dark font-semibold"
											>@{post.author}</span
										>
										<span class="text-text-secondary dark:text-text-secondary-dark">·</span>
										<span class="text-text-secondary dark:text-text-secondary-dark text-sm"
											>{formatTimeAgo(post.createdAt)}</span
										>
									</div>
									<p class="text-text-primary dark:text-text-primary-dark mt-1">{post.content}</p>
									<div
										class="text-text-secondary dark:text-text-secondary-dark mt-3 flex items-center space-x-6"
									>
										<span class="flex items-center space-x-1">
											<span>💬</span>
											<span class="text-sm">{post.comments.length}</span>
										</span>
										<span class="flex items-center space-x-1">
											<span>❤️</span>
											<span class="text-sm">{post.likes}</span>
										</span>
									</div>
								</div>
							</div>
						</article>
					{/each}
				{/if}
			{:else if activeTab === 'likes'}
				{#if likedPosts.length === 0}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark p-8 text-center">
						<p class="text-text-secondary dark:text-text-secondary-dark">
							No liked posts yet. Start exploring!
						</p>
					</div>
				{:else}
					{#each likedPosts as post}
						<article
							class="bg-bg-primary dark:bg-bg-secondary-dark p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
						>
							<div class="flex space-x-3">
								<div
									class="bg-accent dark:bg-accent-dark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
								>
									<span class="text-sm font-semibold text-white"
										>{post.author.charAt(0).toUpperCase()}</span
									>
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center space-x-2">
										<span class="text-text-primary dark:text-text-primary-dark font-semibold"
											>@{post.author}</span
										>
										<span class="text-text-secondary dark:text-text-secondary-dark">·</span>
										<span class="text-text-secondary dark:text-text-secondary-dark text-sm"
											>{formatTimeAgo(post.createdAt)}</span
										>
									</div>
									<p class="text-text-primary dark:text-text-primary-dark mt-1">{post.content}</p>
									<div
										class="text-text-secondary dark:text-text-secondary-dark mt-3 flex items-center space-x-6"
									>
										<span class="flex items-center space-x-1">
											<span>💬</span>
											<span class="text-sm">{post.comments.length}</span>
										</span>
										<span class="flex items-center space-x-1">
											<span class="text-red-500">❤️</span>
											<span class="text-sm">{post.likes}</span>
										</span>
									</div>
								</div>
							</div>
						</article>
					{/each}
				{/if}
			{:else if activeTab === 'comments'}
				{#if userComments.length === 0}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark p-8 text-center">
						<p class="text-text-secondary dark:text-text-secondary-dark">
							No comments yet. Join the conversation!
						</p>
					</div>
				{:else}
					{#each userComments as comment}
						<article
							class="bg-bg-primary dark:bg-bg-secondary-dark p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
						>
							<div class="flex space-x-3">
								<div
									class="bg-accent dark:bg-accent-dark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
								>
									<span class="text-sm font-semibold text-white"
										>{comment.author.charAt(0).toUpperCase()}</span
									>
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center space-x-2">
										<span class="text-text-primary dark:text-text-primary-dark font-semibold"
											>@{comment.author}</span
										>
										<span class="text-text-secondary dark:text-text-secondary-dark">·</span>
										<span class="text-text-secondary dark:text-text-secondary-dark text-sm"
											>{formatTimeAgo(comment.createdAt)}</span
										>
									</div>
									<p class="text-text-primary dark:text-text-primary-dark mt-1">
										{comment.content}
									</p>
									{#if comment.postId}
										<p class="text-text-secondary dark:text-text-secondary-dark mt-2 text-sm">
											Replying to a post
										</p>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				{/if}
			{/if}
		</div>

		<div
			class="bg-bg-primary dark:bg-bg-secondary-dark border-t border-gray-200 p-4 dark:border-gray-700"
		>
			<form method="post" action="?/logout" use:enhance>
				<button
					class="w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
				>
					Sign out
				</button>
			</form>
		</div>
	</div>
</main>
