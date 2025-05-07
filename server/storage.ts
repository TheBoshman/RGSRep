import { 
  users, type User, type InsertUser,
  searchHistory, type SearchHistory, type InsertSearchHistory,
  favorites, type Favorite, type InsertFavorite,
  badges, type Badge, type InsertBadge,
  GameStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Search history methods
  getSearchHistory(userId?: number, limit?: number): Promise<SearchHistory[]>;
  saveSearchHistory(searchData: InsertSearchHistory): Promise<SearchHistory>;
  deleteSearchHistory(id: number): Promise<void>;
  clearSearchHistory(userId?: number): Promise<void>;
  
  // Favorites methods
  getFavorites(userId?: number): Promise<Favorite[]>;
  saveFavorite(favoriteData: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;
  updateFavoriteNotes(id: number, notes: string): Promise<Favorite>;
  
  // Badges methods
  getGameBadges(gameId: string): Promise<Badge[]>;
  saveBadge(badgeData: InsertBadge): Promise<Badge>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Search history methods
  async getSearchHistory(userId?: number, limit: number = 10): Promise<SearchHistory[]> {
    if (userId) {
      return await db.select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.searchedAt))
        .limit(limit);
    } else {
      return await db.select()
        .from(searchHistory)
        .orderBy(desc(searchHistory.searchedAt))
        .limit(limit);
    }
  }

  async saveSearchHistory(searchData: InsertSearchHistory): Promise<SearchHistory> {
    const [savedSearch] = await db
      .insert(searchHistory)
      .values(searchData)
      .returning();
    
    return savedSearch;
  }

  async deleteSearchHistory(id: number): Promise<void> {
    await db.delete(searchHistory).where(eq(searchHistory.id, id));
  }

  async clearSearchHistory(userId?: number): Promise<void> {
    if (userId) {
      await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
    } else {
      await db.delete(searchHistory);
    }
  }

  // Favorites methods
  async getFavorites(userId?: number): Promise<Favorite[]> {
    if (userId) {
      return await db.select()
        .from(favorites)
        .where(eq(favorites.userId, userId))
        .orderBy(desc(favorites.addedAt));
    } else {
      return await db.select()
        .from(favorites)
        .orderBy(desc(favorites.addedAt));
    }
  }

  async saveFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();
    
    return favorite;
  }

  async deleteFavorite(id: number): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  async updateFavoriteNotes(id: number, notes: string): Promise<Favorite> {
    const [favorite] = await db
      .update(favorites)
      .set({ notes })
      .where(eq(favorites.id, id))
      .returning();
    
    return favorite;
  }

  // Badges methods
  async getGameBadges(gameId: string): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .where(eq(badges.gameId, gameId));
  }

  async saveBadge(badgeData: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(badgeData)
      .returning();
    
    return badge;
  }
}

export const storage = new DatabaseStorage();
