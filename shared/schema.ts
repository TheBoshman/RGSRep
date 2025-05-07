import { pgTable, text, serial, integer, timestamp, boolean, primaryKey, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Search history table to track user searches
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  placeId: text("place_id").notNull(),
  name: text("name").notNull(),
  thumbnail: text("thumbnail").notNull(),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

// Favorites table to store user's favorite games
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  placeId: text("place_id").notNull(),
  name: text("name").notNull(),
  thumbnail: text("thumbnail").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Game badges table to store badge information
export const badges = pgTable("badges", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  enabled: boolean("enabled").default(true),
  awardedCount: integer("awarded_count"),
  winRate: integer("win_rate"),
});

// Define relations for the tables
export const usersRelations = relations(users, ({ many }) => ({
  searchHistory: many(searchHistory),
  favorites: many(favorites),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory);
export const insertFavoriteSchema = createInsertSchema(favorites);
export const insertBadgeSchema = createInsertSchema(badges);

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

// Game data schema types (for frontend and API response types)
export interface GameStats {
  place_id: string;
  universe_id: string;
  name: string;
  playing: string;
  visits: string;
  favoritedCount: string;
  upVotes: string;
  downVotes: string;
  thumbnail_url: string;
  creator_name: string;
  creator_avatar_url: string;
}

// API Response types for server implementation
export interface UniverseResponse {
  universeId: string;
}

export interface GameResponse {
  data: GameResponseData[];
}

export interface GameResponseData {
  id: number; 
  name: string;
  playing: number;
  visits: number;
  favoritedCount: number;
  creator: {
    id: number;
    name: string;
  };
}

export interface VoteResponse {
  data: VoteResponseData[];
}

export interface VoteResponseData {
  upVotes: number;
  downVotes: number;
}

export interface ThumbnailResponse {
  data: ThumbnailResponseData[];
}

export interface ThumbnailResponseData {
  thumbnails: ThumbnailItem[];
}

export interface ThumbnailItem {
  imageUrl: string;
}

export interface UserResponse {
  name: string;
}

export interface UserThumbnailResponse {
  data: UserThumbnailItem[];
}

export interface UserThumbnailItem {
  imageUrl: string;
}
