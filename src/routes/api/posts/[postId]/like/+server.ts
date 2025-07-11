import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as posts from '$lib/server/db/posts';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { postId } = params;
	
	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		const result = await posts.toggleLike(postId, locals.user.id);
		
		return json(result);
	} catch (error) {
		console.error('Error toggling like:', error);
		return json({ error: 'Failed to toggle like' }, { status: 500 });
	}
};
