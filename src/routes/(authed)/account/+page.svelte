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
	}

	type Comment = {
		id: string;
		content: string;
		author: string;
		createdAt: string;
		postId?: string;
	}

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

<main class="min-h-screen bg-bg-secondary dark:bg-bg-primary-dark">
	<div class="max-w-2xl mx-auto">
		
		<header class="bg-bg-primary dark:bg-bg-secondary-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
			<div class="px-4 py-3">
				<h1 class="text-xl font-bold text-text-primary dark:text-text-primary-dark">Profile</h1>
			</div>
		</header>

		
		<div class="bg-bg-primary dark:bg-bg-secondary-dark border-b border-gray-200 dark:border-gray-700 p-6">
			<div class="flex items-center space-x-4">
				<div class="w-16 h-16 bg-accent dark:bg-accent-dark rounded-full flex items-center justify-center">
					<span class="text-white font-bold text-xl">{data.user.username.charAt(0).toUpperCase()}</span>
				</div>
				<div>
					<h2 class="text-2xl font-bold text-text-primary dark:text-text-primary-dark">@{data.user.username}</h2>
					<p class="text-text-secondary dark:text-text-secondary-dark">Active member</p>
				</div>
			</div>
			
			
			<div class="flex space-x-6 mt-4">
				<div class="text-center">
					<div class="text-xl font-bold text-text-primary dark:text-text-primary-dark">{stats.posts}</div>
					<div class="text-sm text-text-secondary dark:text-text-secondary-dark">Posts</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-text-primary dark:text-text-primary-dark">{stats.likes}</div>
					<div class="text-sm text-text-secondary dark:text-text-secondary-dark">Likes</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-text-primary dark:text-text-primary-dark">{stats.comments}</div>
					<div class="text-sm text-text-secondary dark:text-text-secondary-dark">Comments</div>
				</div>
			</div>
		</div>

		
		<div class="bg-bg-primary dark:bg-bg-secondary-dark border-b border-gray-200 dark:border-gray-700">
			<div class="flex">
				<button
					class="flex-1 px-4 py-3 text-center font-medium transition-colors
						{activeTab === 'posts' 
							? 'text-accent dark:text-accent-dark border-b-2 border-accent dark:border-accent-dark' 
							: 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
						}"
					onclick={() => activeTab = 'posts'}
				>
					Posts
				</button>
				<button
					class="flex-1 px-4 py-3 text-center font-medium transition-colors
						{activeTab === 'likes' 
							? 'text-accent dark:text-accent-dark border-b-2 border-accent dark:border-accent-dark' 
							: 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
						}"
					onclick={() => activeTab = 'likes'}
				>
					Likes
				</button>
				<button
					class="flex-1 px-4 py-3 text-center font-medium transition-colors
						{activeTab === 'comments' 
							? 'text-accent dark:text-accent-dark border-b-2 border-accent dark:border-accent-dark' 
							: 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
						}"
					onclick={() => activeTab = 'comments'}
				>
					Comments
				</button>
			</div>
		</div>

		
		<div class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if isLoading}
				
				{#each Array(3) as _}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark p-4 animate-pulse">
						<div class="flex space-x-3">
							<div class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
								<div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
								<div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
							</div>
						</div>
					</div>
				{/each}
			{:else if activeTab === 'posts'}
				{#if userPosts.length === 0}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark p-8 text-center">
						<p class="text-text-secondary dark:text-text-secondary-dark">No posts yet. Share your first thought!</p>
					</div>
				{:else}
					{#each userPosts as post}
						<article class="bg-bg-primary dark:bg-bg-secondary-dark p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
							<div class="flex space-x-3">
								<div class="w-10 h-10 bg-accent dark:bg-accent-dark rounded-full flex items-center justify-center flex-shrink-0">
									<span class="text-white font-semibold text-sm">{post.author.charAt(0).toUpperCase()}</span>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-2">
										<span class="font-semibold text-text-primary dark:text-text-primary-dark">@{post.author}</span>
										<span class="text-text-secondary dark:text-text-secondary-dark">·</span>
										<span class="text-text-secondary dark:text-text-secondary-dark text-sm">{formatTimeAgo(post.createdAt)}</span>
									</div>
									<p class="text-text-primary dark:text-text-primary-dark mt-1">{post.content}</p>
									<div class="flex items-center space-x-6 mt-3 text-text-secondary dark:text-text-secondary-dark">
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
						<p class="text-text-secondary dark:text-text-secondary-dark">No liked posts yet. Start exploring!</p>
					</div>
				{:else}
					{#each likedPosts as post}
						<article class="bg-bg-primary dark:bg-bg-secondary-dark p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
							<div class="flex space-x-3">
								<div class="w-10 h-10 bg-accent dark:bg-accent-dark rounded-full flex items-center justify-center flex-shrink-0">
									<span class="text-white font-semibold text-sm">{post.author.charAt(0).toUpperCase()}</span>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-2">
										<span class="font-semibold text-text-primary dark:text-text-primary-dark">@{post.author}</span>
										<span class="text-text-secondary dark:text-text-secondary-dark">·</span>
										<span class="text-text-secondary dark:text-text-secondary-dark text-sm">{formatTimeAgo(post.createdAt)}</span>
									</div>
									<p class="text-text-primary dark:text-text-primary-dark mt-1">{post.content}</p>
									<div class="flex items-center space-x-6 mt-3 text-text-secondary dark:text-text-secondary-dark">
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
						<p class="text-text-secondary dark:text-text-secondary-dark">No comments yet. Join the conversation!</p>
					</div>
				{:else}
					{#each userComments as comment}
						<article class="bg-bg-primary dark:bg-bg-secondary-dark p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
							<div class="flex space-x-3">
								<div class="w-10 h-10 bg-accent dark:bg-accent-dark rounded-full flex items-center justify-center flex-shrink-0">
									<span class="text-white font-semibold text-sm">{comment.author.charAt(0).toUpperCase()}</span>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-2">
										<span class="font-semibold text-text-primary dark:text-text-primary-dark">@{comment.author}</span>
										<span class="text-text-secondary dark:text-text-secondary-dark">·</span>
										<span class="text-text-secondary dark:text-text-secondary-dark text-sm">{formatTimeAgo(comment.createdAt)}</span>
									</div>
									<p class="text-text-primary dark:text-text-primary-dark mt-1">{comment.content}</p>
									{#if comment.postId}
										<p class="text-text-secondary dark:text-text-secondary-dark text-sm mt-2">Replying to a post</p>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				{/if}
			{/if}
		</div>

		
		<div class="bg-bg-primary dark:bg-bg-secondary-dark border-t border-gray-200 dark:border-gray-700 p-4">
			<form method="post" action="?/logout" use:enhance>
				<button class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
					Sign out
				</button>
			</form>
		</div>
	</div>
</main>
