import { db } from './index';
import { post, comment, like, user, userActivity, follow } from './schema';
import { eq, desc, sql, and, count, asc, or, inArray } from 'drizzle-orm';

export interface PostWithDetails {
	id: string;
	content: string;
	author: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	likesCount: number;
	commentsCount: number;
	isLikedByUser?: boolean;
	isFollowingAuthor?: boolean;
	comments: Array<{
		id: string;
		content: string;
		author: string;
		authorId: string;
		createdAt: Date;
		updatedAt: Date;
	}>;
}

export interface UserStats {
	postsCount: number;
	likesCount: number;
	commentsCount: number;
	followersCount: number;
	followingCount: number;
}

async function trackActivity(
	userId: string,
	activityType: string,
	targetId?: string,
	metadata?: Record<string, any>
) {
	await db.insert(userActivity).values({
		id: generateId(),
		userId,
		activityType,
		targetId,
		metadata: metadata ? JSON.stringify(metadata) : null,
		createdAt: new Date()
	});
}

export async function getAllPosts(
	userId?: string,
	limit = 50,
	offset = 0
): Promise<PostWithDetails[]> {
	const now = new Date();

	const postsQuery = db
		.select({
			id: post.id,
			content: post.content,
			authorId: post.authorId,
			createdAt: post.createdAt,
			author: user.username
		})
		.from(post)
		.leftJoin(user, eq(post.authorId, user.id))
		.orderBy(desc(post.createdAt))
		.limit(limit)
		.offset(offset);

	const posts = await postsQuery;

	if (posts.length === 0) return [];

	const postIds = posts.map((p) => p.id);

	const likesData = await db
		.select({
			postId: like.postId,
			count: count()
		})
		.from(like)
		.where(inArray(like.postId, postIds))
		.groupBy(like.postId);

	const commentsData = await db
		.select({
			postId: comment.postId,
			count: count()
		})
		.from(comment)
		.where(inArray(comment.postId, postIds))
		.groupBy(comment.postId);

	let userLikes: string[] = [];
	let userFollowing: string[] = [];
	if (userId) {
		const userLikesData = await db
			.select({ postId: like.postId })
			.from(like)
			.where(and(eq(like.userId, userId), inArray(like.postId, postIds)));
		userLikes = userLikesData.map((l) => l.postId);

		const followingData = await db
			.select({ followingId: follow.followingId })
			.from(follow)
			.where(eq(follow.followerId, userId));
		userFollowing = followingData.map((f) => f.followingId);
	}

	const commentsQuery = await db
		.select({
			id: comment.id,
			content: comment.content,
			authorId: comment.authorId,
			postId: comment.postId,
			createdAt: comment.createdAt,
			author: user.username
		})
		.from(comment)
		.leftJoin(user, eq(comment.authorId, user.id))
		.where(inArray(comment.postId, postIds))
		.orderBy(asc(comment.createdAt));

	const likesMap = new Map(likesData.map((l) => [l.postId, l.count]));
	const commentsCountMap = new Map(commentsData.map((c) => [c.postId, c.count]));
	const commentsMap = new Map<string, typeof commentsQuery>();

	commentsQuery.forEach((comment) => {
		if (!commentsMap.has(comment.postId)) {
			commentsMap.set(comment.postId, []);
		}
		commentsMap.get(comment.postId)!.push(comment);
	});

	const postsWithDetails: PostWithDetails[] = posts.map((p) => ({
		id: p.id,
		content: p.content,
		author: p.author || 'Unknown',
		authorId: p.authorId,
		createdAt: new Date(p.createdAt),
		updatedAt: new Date(p.createdAt),
		likesCount: likesMap.get(p.id) || 0,
		commentsCount: commentsCountMap.get(p.id) || 0,
		isLikedByUser: userId ? userLikes.includes(p.id) : false,
		isFollowingAuthor: userId ? userFollowing.includes(p.authorId) : false,
		comments: (commentsMap.get(p.id) || []).map((c) => ({
			id: c.id,
			content: c.content,
			author: c.author || 'Unknown',
			authorId: c.authorId,
			createdAt: new Date(c.createdAt),
			updatedAt: new Date(c.createdAt)
		}))
	}));

	return postsWithDetails;
}

export async function createPost(content: string, authorId: string): Promise<string> {
	const postId = generateId();
	const now = new Date();

	await db.insert(post).values({
		id: postId,
		content,
		authorId,
		createdAt: now
	});

	await trackActivity(authorId, 'post', postId, { content });

	return postId;
}

export async function toggleLike(
	postId: string,
	userId: string
): Promise<{ isLiked: boolean; likesCount: number }> {
	const existingLike = await db
		.select()
		.from(like)
		.where(and(eq(like.postId, postId), eq(like.userId, userId)))
		.limit(1);

	if (existingLike.length > 0) {
		await db.delete(like).where(and(eq(like.postId, postId), eq(like.userId, userId)));

		await trackActivity(userId, 'unlike', postId);
	} else {
		await db.insert(like).values({
			id: generateId(),
			postId,
			userId,
			createdAt: new Date()
		});

		await trackActivity(userId, 'like', postId);
	}

	const likesResult = await db.select({ count: count() }).from(like).where(eq(like.postId, postId));
	const likesCount = likesResult[0]?.count || 0;

	return {
		isLiked: existingLike.length === 0,
		likesCount
	};
}

export async function addComment(
	postId: string,
	content: string,
	authorId: string
): Promise<string> {
	const commentId = generateId();
	const now = new Date();

	await db.insert(comment).values({
		id: commentId,
		content,
		authorId,
		postId,
		createdAt: now
	});

	await trackActivity(authorId, 'comment', commentId, { postId, content });

	return commentId;
}

export async function getUserPosts(userId: string): Promise<PostWithDetails[]> {
	const userPosts = await db
		.select({
			id: post.id,
			content: post.content,
			authorId: post.authorId,
			createdAt: post.createdAt,
			author: user.username
		})
		.from(post)
		.leftJoin(user, eq(post.authorId, user.id))
		.where(eq(post.authorId, userId))
		.orderBy(desc(post.createdAt));

	return userPosts.map((p) => ({
		id: p.id,
		content: p.content,
		author: p.author || 'Unknown',
		authorId: p.authorId,
		createdAt: new Date(p.createdAt),
		updatedAt: new Date(p.createdAt),
		likesCount: 0,
		commentsCount: 0,
		comments: []
	}));
}

export async function getUserLikedPosts(userId: string): Promise<PostWithDetails[]> {
	const likedPosts = await db
		.select({
			id: post.id,
			content: post.content,
			authorId: post.authorId,
			createdAt: post.createdAt,
			author: user.username
		})
		.from(like)
		.leftJoin(post, eq(like.postId, post.id))
		.leftJoin(user, eq(post.authorId, user.id))
		.where(eq(like.userId, userId))
		.orderBy(desc(like.createdAt));

	return likedPosts
		.filter((p) => p.id !== null)
		.map((p) => ({
			id: p.id!,
			content: p.content || '',
			author: p.author || 'Unknown',
			authorId: p.authorId || '',
			createdAt: new Date(p.createdAt || 0),
			updatedAt: new Date(p.createdAt || 0),
			likesCount: 0,
			commentsCount: 0,
			isLikedByUser: true,
			comments: []
		}));
}

export async function getUserComments(userId: string) {
	return await db
		.select({
			id: comment.id,
			content: comment.content,
			createdAt: comment.createdAt,
			postId: comment.postId,
			postContent: post.content,
			postAuthor: user.username
		})
		.from(comment)
		.leftJoin(post, eq(comment.postId, post.id))
		.leftJoin(user, eq(post.authorId, user.id))
		.where(eq(comment.authorId, userId))
		.orderBy(desc(comment.createdAt));
}

export async function getUserStats(userId: string): Promise<UserStats> {
	const [postsCount, likesCount, commentsCount, followersCount, followingCount] = await Promise.all(
		[
			db.select({ count: count() }).from(post).where(eq(post.authorId, userId)),

			db
				.select({ count: count() })
				.from(like)
				.leftJoin(post, eq(like.postId, post.id))
				.where(eq(post.authorId, userId)),

			db.select({ count: count() }).from(comment).where(eq(comment.authorId, userId)),

			db.select({ count: count() }).from(follow).where(eq(follow.followingId, userId)),

			db.select({ count: count() }).from(follow).where(eq(follow.followerId, userId))
		]
	);

	return {
		postsCount: postsCount[0]?.count || 0,
		likesCount: likesCount[0]?.count || 0,
		commentsCount: commentsCount[0]?.count || 0,
		followersCount: followersCount[0]?.count || 0,
		followingCount: followingCount[0]?.count || 0
	};
}

export async function toggleFollow(
	followerId: string,
	followingId: string
): Promise<{ isFollowing: boolean }> {
	if (followerId === followingId) {
		throw new Error('Cannot follow yourself');
	}

	const existingFollow = await db
		.select()
		.from(follow)
		.where(and(eq(follow.followerId, followerId), eq(follow.followingId, followingId)))
		.limit(1);

	if (existingFollow.length > 0) {
		await db
			.delete(follow)
			.where(and(eq(follow.followerId, followerId), eq(follow.followingId, followingId)));

		await trackActivity(followerId, 'unfollow', followingId);
		return { isFollowing: false };
	} else {
		await db.insert(follow).values({
			id: generateId(),
			followerId,
			followingId,
			createdAt: new Date()
		});

		await trackActivity(followerId, 'follow', followingId);
		return { isFollowing: true };
	}
}

export async function getUserFeed(
	userId: string,
	limit = 50,
	offset = 0
): Promise<PostWithDetails[]> {
	const followingUsers = await db
		.select({ followingId: follow.followingId })
		.from(follow)
		.where(eq(follow.followerId, userId));

	if (followingUsers.length === 0) {
		return getAllPosts(userId, limit, offset);
	}

	const followingIds = followingUsers.map((f) => f.followingId);

	const feedPosts = await db
		.select({
			id: post.id,
			content: post.content,
			authorId: post.authorId,
			createdAt: post.createdAt,
			author: user.username
		})
		.from(post)
		.leftJoin(user, eq(post.authorId, user.id))
		.where(inArray(post.authorId, followingIds))
		.orderBy(desc(post.createdAt))
		.limit(limit)
		.offset(offset);

	if (feedPosts.length === 0) return [];

	const postIds = feedPosts.map((p) => p.id);

	const [likesData, commentsData, userLikes] = await Promise.all([
		db
			.select({ postId: like.postId, count: count() })
			.from(like)
			.where(inArray(like.postId, postIds))
			.groupBy(like.postId),

		db
			.select({ postId: comment.postId, count: count() })
			.from(comment)
			.where(inArray(comment.postId, postIds))
			.groupBy(comment.postId),

		db
			.select({ postId: like.postId })
			.from(like)
			.where(and(eq(like.userId, userId), inArray(like.postId, postIds)))
	]);

	const likesMap = new Map(likesData.map((l) => [l.postId, l.count]));
	const commentsCountMap = new Map(commentsData.map((c) => [c.postId, c.count]));
	const userLikesSet = new Set(userLikes.map((l) => l.postId));

	return feedPosts.map((p) => ({
		id: p.id,
		content: p.content,
		author: p.author || 'Unknown',
		authorId: p.authorId,
		createdAt: new Date(p.createdAt),
		updatedAt: new Date(p.createdAt),
		likesCount: likesMap.get(p.id) || 0,
		commentsCount: commentsCountMap.get(p.id) || 0,
		isLikedByUser: userLikesSet.has(p.id),
		isFollowingAuthor: true,
		comments: []
	}));
}

export async function getUserActivity(userId: string, limit = 50): Promise<any[]> {
	return await db
		.select()
		.from(userActivity)
		.where(eq(userActivity.userId, userId))
		.orderBy(desc(userActivity.createdAt))
		.limit(limit);
}

function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
