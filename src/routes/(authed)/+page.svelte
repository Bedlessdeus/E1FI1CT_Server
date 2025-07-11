<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
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
	};

	let posts: Post[] = $state([]);
	let isLoading = $state(true);
	let newPostContent = $state('');
	let ws: WebSocket | null = null;
	let commentInputs: { [postId: string]: string } = $state({});

	function connectWebSocket() {
		if (!browser) return;

		if (ws && ws.readyState === WebSocket.OPEN) {
			return;
		}

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}/api/ws`;
		console.log('Connecting to WebSocket:', wsUrl);
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('WebSocket connected successfully');
			if (data.user?.id) {
				ws!.send(JSON.stringify({ type: 'authenticate', userId: data.user.id }));
			}
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			switch (data.type) {
				case 'new_post':
					posts = [data.post, ...posts];
					break;
				case 'post_liked':
					posts = posts.map((post) =>
						post.id === data.postId ? { ...post, likes: data.likes, isLiked: data.isLiked } : post
					);
					break;
				case 'new_comment':
					posts = posts.map((post) =>
						post.id === data.postId ? { ...post, comments: [...post.comments, data.comment] } : post
					);
					break;
			}
		};

		ws.onclose = (event) => {
			console.log('WebSocket disconnected', event.code, event.reason);
			if (event.code !== 1001 && event.code !== 1000) {
				setTimeout(connectWebSocket, 3000);
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}

	async function loadPosts() {
		isLoading = true;

		try {
			const response = await fetch('/api/posts');
			if (response.ok) {
				const data = await response.json();
				posts = data.posts.map((post: any) => ({
					...post,
					comments: post.comments || []
				}));
			} else {
				console.error('Failed to load posts');
			}
		} catch (error) {
			console.error('Error loading posts:', error);
		} finally {
			isLoading = false;
		}
	}

	async function createPost() {
		if (!newPostContent.trim()) return;

		try {
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ content: newPostContent })
			});

			if (response.ok) {
				const { post } = await response.json();

				if (ws && ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ type: 'create_post', post }));
				}

				posts = [post, ...posts];
				newPostContent = '';
			} else {
				console.error('Failed to create post');
			}
		} catch (error) {
			console.error('Error creating post:', error);
		}
	}

	async function toggleLike(postId: string) {
		try {
			const response = await fetch(`/api/posts/${postId}/like`, {
				method: 'POST'
			});

			if (response.ok) {
				const { likesCount, isLiked } = await response.json();

				if (ws && ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ type: 'like_post', postId, likes: likesCount, isLiked }));
				}

				posts = posts.map((p) => (p.id === postId ? { ...p, likes: likesCount, isLiked } : p));
			} else {
				console.error('Failed to toggle like');
			}
		} catch (error) {
			console.error('Error toggling like:', error);
		}
	}

	async function addComment(postId: string) {
		const content = commentInputs[postId];
		if (!content?.trim()) return;

		try {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ content })
			});

			if (response.ok) {
				const { comment } = await response.json();

				if (ws && ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ type: 'add_comment', postId, comment }));
				}

				posts = posts.map((post) =>
					post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
				);

				commentInputs[postId] = '';
			} else {
				console.error('Failed to add comment');
			}
		} catch (error) {
			console.error('Error adding comment:', error);
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
		loadPosts();
		connectWebSocket();

		return () => {
			if (ws) ws.close();
		};
	});
</script>

<main class="bg-bg-secondary dark:bg-bg-primary-dark min-h-screen">
	<div class="mx-auto max-w-2xl">
		<header
			class="bg-bg-primary dark:bg-bg-secondary-dark sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700"
		>
			<div class="px-4 py-3">
				<h1 class="text-text-primary dark:text-text-primary-dark text-xl font-bold">Home</h1>
			</div>
		</header>

		<div
			class="bg-bg-primary dark:bg-bg-secondary-dark border-b border-gray-200 p-4 dark:border-gray-700"
		>
			<div class="flex space-x-3">
				<div
					class="bg-accent dark:bg-accent-dark flex h-10 w-10 items-center justify-center rounded-full"
				>
					<span class="text-sm font-semibold text-white">U</span>
				</div>
				<div class="flex-1">
					<textarea
						bind:value={newPostContent}
						placeholder="What's happening?"
						class="text-text-primary dark:text-text-primary-dark placeholder-text-secondary dark:placeholder-text-secondary-dark w-full resize-none border-none bg-transparent text-xl outline-none"
						rows="3"
						maxlength="280"
					></textarea>
					<div class="mt-3 flex items-center justify-between">
						<span class="text-text-secondary dark:text-text-secondary-dark text-sm">
							{280 - newPostContent.length} characters remaining
						</span>
						<button
							onclick={createPost}
							disabled={!newPostContent.trim()}
							class="bg-accent dark:bg-accent-dark rounded-full px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-500"
						>
							Post
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if isLoading}
				{#each Array(3) as _, i}
					<div class="bg-bg-primary dark:bg-bg-secondary-dark animate-pulse p-4">
						<div class="flex space-x-3">
							<div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
							<div class="flex-1">
								<div class="mb-2 flex items-center space-x-2">
									<div class="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600"></div>
									<div class="h-4 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
								</div>
								<div class="mb-3 space-y-2">
									<div class="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
									<div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
								</div>
								<div class="flex space-x-6">
									<div class="h-4 w-12 rounded bg-gray-300 dark:bg-gray-600"></div>
									<div class="h-4 w-12 rounded bg-gray-300 dark:bg-gray-600"></div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				{#each posts as post (post.id)}
					<article
						class="bg-bg-primary dark:bg-bg-secondary-dark p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
					>
						<div class="flex space-x-3">
							<div
								class="bg-accent dark:bg-accent-dark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
							>
								<span class="text-sm font-semibold text-white">{post.author[0].toUpperCase()}</span>
							</div>

							<div class="min-w-0 flex-1">
								<div class="mb-1 flex items-center space-x-2">
									<span class="text-text-primary dark:text-text-primary-dark font-semibold"
										>@{post.author}</span
									>
									<span class="text-text-secondary dark:text-text-secondary-dark text-sm">·</span>
									<span class="text-text-secondary dark:text-text-secondary-dark text-sm"
										>{formatTimeAgo(post.createdAt)}</span
									>
								</div>

								<p class="text-text-primary dark:text-text-primary-dark mb-3 whitespace-pre-wrap">
									{post.content}
								</p>

								<div
									class="text-text-secondary dark:text-text-secondary-dark flex items-center space-x-6"
								>
									<button
										class="hover:text-accent dark:hover:text-accent-dark group flex items-center space-x-2 transition-colors"
									>
										<div
											class="rounded-full p-2 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"
										>
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
												></path>
											</svg>
										</div>
										<span class="text-sm">{post.comments.length}</span>
									</button>

									<button
										onclick={() => toggleLike(post.id)}
										class="group flex items-center space-x-2 transition-colors hover:text-red-500"
										class:text-red-500={post.isLiked}
									>
										<div
											class="rounded-full p-2 transition-colors group-hover:bg-red-50 dark:group-hover:bg-red-900/20"
										>
											<svg
												class="h-4 w-4"
												fill={post.isLiked ? 'currentColor' : 'none'}
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												></path>
											</svg>
										</div>
										<span class="text-sm">{post.likes}</span>
									</button>
								</div>

								{#if post.comments.length > 0}
									<div class="mt-4 space-y-3">
										{#each post.comments as comment (comment.id)}
											<div class="flex space-x-3">
												<div
													class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-400"
												>
													<span class="text-xs font-semibold text-white"
														>{comment.author[0].toUpperCase()}</span
													>
												</div>
												<div class="min-w-0 flex-1">
													<div class="mb-1 flex items-center space-x-2">
														<span
															class="text-text-primary dark:text-text-primary-dark text-sm font-medium"
															>@{comment.author}</span
														>
														<span class="text-text-secondary dark:text-text-secondary-dark text-xs"
															>{formatTimeAgo(comment.createdAt)}</span
														>
													</div>
													<p class="text-text-primary dark:text-text-primary-dark text-sm">
														{comment.content}
													</p>
												</div>
											</div>
										{/each}
									</div>
								{/if}

								<div class="mt-3 flex space-x-3">
									<div
										class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-400"
									>
										<span class="text-xs font-semibold text-white">U</span>
									</div>
									<div class="flex-1">
										<input
											bind:value={commentInputs[post.id]}
											placeholder="Add a comment..."
											class="bg-bg-secondary dark:bg-bg-primary-dark text-text-primary dark:text-text-primary-dark placeholder-text-secondary dark:placeholder-text-secondary-dark focus:border-accent dark:focus:border-accent-dark w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none dark:border-gray-600"
											onkeydown={(e) => {
												if (e.key === 'Enter') {
													addComment(post.id);
												}
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</article>
				{/each}
			{/if}
		</div>
	</div>
</main>

<style>
	:global(html) {
		scrollbar-width: thin;
		scrollbar-color: rgb(203 213 225) transparent;
	}

	:global(html:dark) {
		scrollbar-color: rgb(71 85 105) transparent;
	}
</style>
