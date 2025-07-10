import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertPredictionSchema, insertBlogPostSchema, insertUserPredictionAccessSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Predictions routes
  app.get('/api/predictions', async (req, res) => {
    try {
      const { premium, limit } = req.query;
      const isPremium = premium === 'true';
      const predictions = await storage.getPredictions(isPremium, limit ? parseInt(limit as string) : undefined);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  app.get('/api/predictions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prediction = await storage.getPrediction(id);
      
      if (!prediction) {
        return res.status(404).json({ message: "Prediction not found" });
      }

      // Check if user has access to premium predictions
      if (prediction.isPremium && req.user) {
        const userId = (req.user as any).claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user || (user.subscriptionTier === 'free' && !await storage.getUserPredictionAccess(userId, id))) {
          return res.status(403).json({ message: "Premium subscription required" });
        }
      }

      res.json(prediction);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      res.status(500).json({ message: "Failed to fetch prediction" });
    }
  });

  app.post('/api/predictions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      const prediction = await storage.createPrediction(validatedData);
      res.status(201).json(prediction);
    } catch (error) {
      console.error("Error creating prediction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prediction" });
    }
  });

  app.put('/api/predictions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPredictionSchema.partial().parse(req.body);
      const prediction = await storage.updatePrediction(id, validatedData);
      res.json(prediction);
    } catch (error) {
      console.error("Error updating prediction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update prediction" });
    }
  });

  // Blog routes
  app.get('/api/blog', async (req, res) => {
    try {
      const { published, limit } = req.query;
      const isPublished = published !== 'false';
      const posts = await storage.getBlogPosts(isPublished, limit ? parseInt(limit as string) : undefined);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/blog/:slug', isAuthenticated, async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Only return published posts unless the user is an admin
      const user = req.user as any;
      if (!post.published && (!user || user.claims?.role !== "admin")) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post('/api/blog', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Premium access routes
  app.post('/api/predictions/:id/access', isAuthenticated, async (req, res) => {
    try {
      const predictionId = parseInt(req.params.id);
      const userId = (req.user as any).claims.sub;
      
      // Check if user already has access
      const existingAccess = await storage.getUserPredictionAccess(userId, predictionId);
      if (existingAccess) {
        return res.status(400).json({ message: "Access already granted" });
      }

      const access = await storage.grantPredictionAccess({
        userId,
        predictionId,
      });
      
      res.status(201).json(access);
    } catch (error) {
      console.error("Error granting prediction access:", error);
      res.status(500).json({ message: "Failed to grant access" });
    }
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Subscription routes
  app.post('/api/subscription/upgrade', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const { tier } = req.body;
      
      if (!['pro', 'expert'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      // In a real app, this would integrate with a payment processor
      // For now, we'll just update the user's subscription
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

      await storage.upsertUser({
        id: userId,
        subscriptionTier: tier,
        subscriptionExpiry: expiryDate,
      });

      res.json({ message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { limit } = req.query;
      const users = await storage.getAllUsers(limit ? parseInt(limit as string) : undefined);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete('/api/admin/predictions/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const predictionId = parseInt(req.params.id);
      await storage.deletePrediction(predictionId);
      res.json({ message: "Prediction deleted successfully" });
    } catch (error) {
      console.error("Error deleting prediction:", error);
      res.status(500).json({ message: "Failed to delete prediction" });
    }
  });

  app.put('/api/admin/blog/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateBlogPost(postId, validatedData);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete('/api/admin/blog/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      await storage.deleteBlogPost(postId);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
