import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, expert
  subscriptionExpiry: timestamp("subscription_expiry"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  matchDate: timestamp("match_date").notNull(),
  team1: varchar("team1").notNull(),
  team2: varchar("team2").notNull(),
  venue: varchar("venue"),
  championship: varchar("championship").notNull(),
  predictionType: varchar("prediction_type").notNull(), // 1N2, Over/Under, etc.
  prediction: varchar("prediction").notNull(),
  odds: decimal("odds", { precision: 4, scale: 2 }),
  confidence: integer("confidence"), // 1-5 stars
  analysis: text("analysis"),
  status: varchar("status").default("scheduled"), // scheduled, ongoing, won, lost
  actualResult: varchar("actual_result"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  author: varchar("author").notNull(),
  readingTime: integer("reading_time"), // in minutes
  featuredImage: varchar("featured_image"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPredictionAccess = pgTable("user_prediction_access", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  predictionId: integer("prediction_id").notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  predictionAccess: many(userPredictionAccess),
}));

export const predictionRelations = relations(predictions, ({ many }) => ({
  userAccess: many(userPredictionAccess),
}));

export const userPredictionAccessRelations = relations(userPredictionAccess, ({ one }) => ({
  user: one(users, {
    fields: [userPredictionAccess.userId],
    references: [users.id],
  }),
  prediction: one(predictions, {
    fields: [userPredictionAccess.predictionId],
    references: [predictions.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPredictionAccessSchema = createInsertSchema(userPredictionAccess).omit({
  id: true,
  purchasedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UserPredictionAccess = typeof userPredictionAccess.$inferSelect;
export type InsertUserPredictionAccess = z.infer<typeof insertUserPredictionAccessSchema>;
