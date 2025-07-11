import { sqliteTable, AnySQLiteColumn, uniqueIndex, text, integer, foreignKey, index } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	age: integer(),
	username: text().notNull(),
	passwordHash: text("password_hash").notNull(),
},
(table) => [
	uniqueIndex("user_username_unique").on(table.username),
]);

export const comment = sqliteTable("comment", {
	id: text().primaryKey().notNull(),
	content: text().notNull(),
	authorId: text("author_id").notNull().references(() => user.id),
	postId: text("post_id").notNull().references(() => post.id),
	createdAt: integer("created_at").notNull(),
});

export const like = sqliteTable("like", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	postId: text("post_id").notNull().references(() => post.id),
	createdAt: integer("created_at").notNull(),
});

export const post = sqliteTable("post", {
	id: text().primaryKey().notNull(),
	content: text().notNull(),
	authorId: text("author_id").notNull().references(() => user.id),
	createdAt: integer("created_at").notNull(),
});

export const follow = sqliteTable("follow", {
	id: text().primaryKey().notNull(),
	followerId: text("follower_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	followingId: text("following_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at").notNull(),
},
(table) => [
	index("follow_following_idx").on(table.followingId),
	index("follow_follower_idx").on(table.followerId),
	uniqueIndex("follow_follower_following_idx").on(table.followerId, table.followingId),
]);

export const userActivity = sqliteTable("user_activity", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	activityType: text("activity_type").notNull(),
	targetId: text("target_id"),
	metadata: text(),
	createdAt: integer("created_at").notNull(),
},
(table) => [
	index("activity_user_type_idx").on(table.userId, table.activityType),
	index("activity_created_at_idx").on(table.createdAt),
	index("activity_type_idx").on(table.activityType),
	index("activity_user_id_idx").on(table.userId),
]);

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	expiresAt: integer("expires_at").notNull(),
},
(table) => [
	index("session_user_id_idx").on(table.userId),
]);

export const newComment = sqliteTable("__new_comment", {
	id: text().primaryKey().notNull(),
	content: text().notNull(),
	authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	postId: text("post_id").notNull().references(() => post.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	isDeleted: integer("is_deleted").default(false).notNull(),
});

