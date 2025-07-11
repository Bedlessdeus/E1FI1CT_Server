import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as posts from '$lib/server/db/posts';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const [userPosts, userLikes, userComments, userStats, userActivity] = await Promise.all([
			posts.getUserPosts(locals.user.id),
			posts.getUserLikedPosts(locals.user.id),
			posts.getUserComments(locals.user.id),
			posts.getUserStats(locals.user.id),
			posts.getUserActivity(locals.user.id, 20)
		]);

		return json({
			user: {
				id: locals.user.id,
				username: locals.user.username
			},
			posts: userPosts,
			likes: userLikes,
			comments: userComments,
			stats: userStats,
			activity: userActivity
		});
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return json({ error: 'Failed to fetch user profile' }, { status: 500 });
	}
};
