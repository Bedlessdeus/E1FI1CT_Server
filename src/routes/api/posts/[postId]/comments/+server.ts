import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as posts from '$lib/server/db/posts';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { postId } = params;
	
	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		const { content } = await request.json();
		
		if (!content || content.trim().length === 0) {
			return json({ error: 'Comment content is required' }, { status: 400 });
		}

		if (content.length > 280) {
			return json({ error: 'Comment too long (max 280 characters)' }, { status: 400 });
		}

		const commentId = await posts.addComment(postId, content.trim(), locals.user.id);
		
				const comment = {
			id: commentId,
			content: content.trim(),
			author: locals.user.username,
			createdAt: new Date().toISOString()
		};
		
		return json({ comment, success: true }, { status: 201 });
	} catch (error) {
		console.error('Error creating comment:', error);
		return json({ error: 'Failed to create comment' }, { status: 500 });
	}
};
