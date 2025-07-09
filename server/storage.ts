import {
  users,
  predictions,
  blogPosts,
  userPredictionAccess,
  type User,
  type UpsertUser,
  type Prediction,
  type InsertPrediction,
  type BlogPost,
  type InsertBlogPost,
  type UserPredictionAccess,
  type InsertUserPredictionAccess,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Prediction operations
  getPredictions(isPremium?: boolean, limit?: number): Promise<Prediction[]>;
  getPrediction(id: number): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, prediction: Partial<InsertPrediction>): Promise<Prediction>;
  
  // Blog operations
  getBlogPosts(published?: boolean, limit?: number): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // User prediction access
  getUserPredictionAccess(userId: string, predictionId: number): Promise<UserPredictionAccess | undefined>;
  grantPredictionAccess(access: InsertUserPredictionAccess): Promise<UserPredictionAccess>;
  
  // Stats
  getStats(): Promise<{
    accuracy: number;
    totalPredictions: number;
    activeUsers: number;
    leagues: number;
  }>;
  
  // Admin operations
  getAllUsers(limit?: number): Promise<User[]>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  deletePrediction(id: number): Promise<void>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Prediction operations
  async getPredictions(isPremium?: boolean, limit = 50): Promise<Prediction[]> {
    if (isPremium !== undefined) {
      return db.select().from(predictions)
        .where(eq(predictions.isPremium, isPremium))
        .orderBy(desc(predictions.matchDate))
        .limit(limit);
    }
    
    return db.select().from(predictions)
      .orderBy(desc(predictions.matchDate))
      .limit(limit);
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id));
    return prediction;
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db
      .insert(predictions)
      .values(prediction)
      .returning();
    return newPrediction;
  }

  async updatePrediction(id: number, prediction: Partial<InsertPrediction>): Promise<Prediction> {
    const [updatedPrediction] = await db
      .update(predictions)
      .set({ ...prediction, updatedAt: new Date() })
      .where(eq(predictions.id, id))
      .returning();
    return updatedPrediction;
  }

  // Blog operations
  async getBlogPosts(published = true, limit = 20): Promise<BlogPost[]> {
    if (published) {
      return db.select().from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.createdAt))
        .limit(limit);
    }
    
    return db.select().from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit);
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  // User prediction access
  async getUserPredictionAccess(userId: string, predictionId: number): Promise<UserPredictionAccess | undefined> {
    const [access] = await db
      .select()
      .from(userPredictionAccess)
      .where(and(
        eq(userPredictionAccess.userId, userId),
        eq(userPredictionAccess.predictionId, predictionId)
      ));
    return access;
  }

  async grantPredictionAccess(access: InsertUserPredictionAccess): Promise<UserPredictionAccess> {
    const [newAccess] = await db
      .insert(userPredictionAccess)
      .values(access)
      .returning();
    return newAccess;
  }

  // Stats
  async getStats(): Promise<{
    accuracy: number;
    totalPredictions: number;
    activeUsers: number;
    leagues: number;
  }> {
    const [accuracyResult] = await db
      .select({
        total: sql<number>`count(*)`,
        won: sql<number>`count(case when status = 'won' then 1 end)`,
      })
      .from(predictions)
      .where(sql`status IN ('won', 'lost')`);

    const [totalPredictions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(predictions);

    const [activeUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [leagues] = await db
      .select({ count: sql<number>`count(distinct championship)` })
      .from(predictions);

    const accuracy = accuracyResult.total > 0 ? (accuracyResult.won / accuracyResult.total) * 100 : 0;

    return {
      accuracy: Math.round(accuracy),
      totalPredictions: totalPredictions.count,
      activeUsers: activeUsers.count,
      leagues: leagues.count,
    };
  }

  // Admin operations
  async getAllUsers(limit = 100): Promise<User[]> {
    return db.select().from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async deletePrediction(id: number): Promise<void> {
    await db.delete(predictions).where(eq(predictions.id, id));
  }

  async updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
}

export const storage = new DatabaseStorage();
