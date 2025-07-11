import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as posts from '$lib/server/db/posts';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const limit = parseInt(url.searchParams.get('limit') || '20');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	try {
		const allPosts = await posts.getAllPosts(locals.user.id, limit, offset);
		return json({ posts: allPosts });
	} catch (error) {
		console.error('Error fetching posts:', error);
		return json({ error: 'Failed to fetch posts' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { content } = await request.json();

		if (!content || content.trim().length === 0) {
			return json({ error: 'Content is required' }, { status: 400 });
		}

		if (content.length > 280) {
			return json({ error: 'Content too long (max 280 characters)' }, { status: 400 });
		}

		const postId = await posts.createPost(content.trim(), locals.user.id);

		const allPosts = await posts.getAllPosts(locals.user.id, 1, 0);
		const newPost = allPosts.find((p) => p.id === postId);

		return json({ post: newPost, success: true }, { status: 201 });
	} catch (error) {
		console.error('Error creating post:', error);
		return json({ error: 'Failed to create post' }, { status: 500 });
	}
};
