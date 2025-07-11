import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable(
	'user',
	{
		id: text('id').primaryKey(),
		age: integer('age'),
		username: text('username').notNull().unique(),
		passwordHash: text('password_hash').notNull()
	},
	(table) => ({
		usernameIdx: uniqueIndex('username_idx').on(table.username)
	})
);

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		userIdIdx: index('session_user_id_idx').on(table.userId)
	})
);

export const post = sqliteTable(
	'post',
	{
		id: text('id').primaryKey(),
		content: text('content').notNull(),
		authorId: text('author_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		authorIdIdx: index('post_author_id_idx').on(table.authorId),
		createdAtIdx: index('post_created_at_idx').on(table.createdAt)
	})
);

export const comment = sqliteTable(
	'comment',
	{
		id: text('id').primaryKey(),
		content: text('content').notNull(),
		authorId: text('author_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		authorIdIdx: index('comment_author_id_idx').on(table.authorId),
		postIdIdx: index('comment_post_id_idx').on(table.postId),
		createdAtIdx: index('comment_created_at_idx').on(table.createdAt)
	})
);

export const like = sqliteTable(
	'like',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		userPostIdx: uniqueIndex('like_user_post_idx').on(table.userId, table.postId),
		userIdIdx: index('like_user_id_idx').on(table.userId),
		postIdIdx: index('like_post_id_idx').on(table.postId)
	})
);

export const userActivity = sqliteTable(
	'user_activity',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		activityType: text('activity_type').notNull(),
		targetId: text('target_id'),
		metadata: text('metadata'),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		userIdIdx: index('activity_user_id_idx').on(table.userId),
		activityTypeIdx: index('activity_type_idx').on(table.activityType),
		createdAtIdx: index('activity_created_at_idx').on(table.createdAt),
		userTypeIdx: index('activity_user_type_idx').on(table.userId, table.activityType)
	})
);

export const follow = sqliteTable(
	'follow',
	{
		id: text('id').primaryKey(),
		followerId: text('follower_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		followingId: text('following_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		followerFollowingIdx: uniqueIndex('follow_follower_following_idx').on(
			table.followerId,
			table.followingId
		),
		followerIdx: index('follow_follower_idx').on(table.followerId),
		followingIdx: index('follow_following_idx').on(table.followingId)
	})
);

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Post = typeof post.$inferSelect;
export type Comment = typeof comment.$inferSelect;
export type Like = typeof like.$inferSelect;
export type UserActivity = typeof userActivity.$inferSelect;
export type Follow = typeof follow.$inferSelect;

export type UserInsert = typeof user.$inferInsert;
export type PostInsert = typeof post.$inferInsert;
export type CommentInsert = typeof comment.$inferInsert;
export type LikeInsert = typeof like.$inferInsert;
export type UserActivityInsert = typeof userActivity.$inferInsert;
export type FollowInsert = typeof follow.$inferInsert;
