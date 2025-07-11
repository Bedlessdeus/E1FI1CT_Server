import { relations } from "drizzle-orm/relations";
import { post, comment, user, like, follow, userActivity, session, newComment } from "./schema";

export const commentRelations = relations(comment, ({one}) => ({
	post: one(post, {
		fields: [comment.postId],
		references: [post.id]
	}),
	user: one(user, {
		fields: [comment.authorId],
		references: [user.id]
	}),
}));

export const postRelations = relations(post, ({one, many}) => ({
	comments: many(comment),
	likes: many(like),
	user: one(user, {
		fields: [post.authorId],
		references: [user.id]
	}),
	newComments: many(newComment),
}));

export const userRelations = relations(user, ({many}) => ({
	comments: many(comment),
	likes: many(like),
	posts: many(post),
	follows_followingId: many(follow, {
		relationName: "follow_followingId_user_id"
	}),
	follows_followerId: many(follow, {
		relationName: "follow_followerId_user_id"
	}),
	userActivities: many(userActivity),
	sessions: many(session),
	newComments: many(newComment),
}));

export const likeRelations = relations(like, ({one}) => ({
	post: one(post, {
		fields: [like.postId],
		references: [post.id]
	}),
	user: one(user, {
		fields: [like.userId],
		references: [user.id]
	}),
}));

export const followRelations = relations(follow, ({one}) => ({
	user_followingId: one(user, {
		fields: [follow.followingId],
		references: [user.id],
		relationName: "follow_followingId_user_id"
	}),
	user_followerId: one(user, {
		fields: [follow.followerId],
		references: [user.id],
		relationName: "follow_followerId_user_id"
	}),
}));

export const userActivityRelations = relations(userActivity, ({one}) => ({
	user: one(user, {
		fields: [userActivity.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const newCommentRelations = relations(newComment, ({one}) => ({
	post: one(post, {
		fields: [newComment.postId],
		references: [post.id]
	}),
	user: one(user, {
		fields: [newComment.authorId],
		references: [user.id]
	}),
}));