var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import fetch from "node-fetch";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  badges: () => badges,
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  insertBadgeSchema: () => insertBadgeSchema,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertSearchHistorySchema: () => insertSearchHistorySchema,
  insertUserSchema: () => insertUserSchema,
  searchHistory: () => searchHistory,
  searchHistoryRelations: () => searchHistoryRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  placeId: text("place_id").notNull(),
  name: text("name").notNull(),
  thumbnail: text("thumbnail").notNull(),
  searchedAt: timestamp("searched_at").defaultNow().notNull()
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  placeId: text("place_id").notNull(),
  name: text("name").notNull(),
  thumbnail: text("thumbnail").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  notes: text("notes")
});
var badges = pgTable("badges", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  enabled: boolean("enabled").default(true),
  awardedCount: integer("awarded_count"),
  winRate: integer("win_rate")
});
var usersRelations = relations(users, ({ many }) => ({
  searchHistory: many(searchHistory),
  favorites: many(favorites)
}));
var searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id]
  })
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertSearchHistorySchema = createInsertSchema(searchHistory);
var insertFavoriteSchema = createInsertSchema(favorites);
var insertBadgeSchema = createInsertSchema(badges);

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Search history methods
  async getSearchHistory(userId, limit = 10) {
    if (userId) {
      return await db.select().from(searchHistory).where(eq(searchHistory.userId, userId)).orderBy(desc(searchHistory.searchedAt)).limit(limit);
    } else {
      return await db.select().from(searchHistory).orderBy(desc(searchHistory.searchedAt)).limit(limit);
    }
  }
  async saveSearchHistory(searchData) {
    const [savedSearch] = await db.insert(searchHistory).values(searchData).returning();
    return savedSearch;
  }
  async deleteSearchHistory(id) {
    await db.delete(searchHistory).where(eq(searchHistory.id, id));
  }
  async clearSearchHistory(userId) {
    if (userId) {
      await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
    } else {
      await db.delete(searchHistory);
    }
  }
  // Favorites methods
  async getFavorites(userId) {
    if (userId) {
      return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.addedAt));
    } else {
      return await db.select().from(favorites).orderBy(desc(favorites.addedAt));
    }
  }
  async saveFavorite(favoriteData) {
    const [favorite] = await db.insert(favorites).values(favoriteData).returning();
    return favorite;
  }
  async deleteFavorite(id) {
    await db.delete(favorites).where(eq(favorites.id, id));
  }
  async updateFavoriteNotes(id, notes) {
    const [favorite] = await db.update(favorites).set({ notes }).where(eq(favorites.id, id)).returning();
    return favorite;
  }
  // Badges methods
  async getGameBadges(gameId) {
    return await db.select().from(badges).where(eq(badges.gameId, gameId));
  }
  async saveBadge(badgeData) {
    const [badge] = await db.insert(badges).values(badgeData).returning();
    return badge;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
async function registerRoutes(app2) {
  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      throw error;
    }
  }
  async function getUniverseIdFromPlaceId(placeId) {
    const url = `https://apis.roproxy.com/universes/v1/places/${placeId}/universe`;
    const data = await fetchData(url);
    if (!data || !data.universeId) {
      throw new Error(`Failed to get Universe ID for Place ID ${placeId}`);
    }
    return data.universeId;
  }
  async function getGameData(universeId) {
    const url = `https://games.roproxy.com/v1/games?universeIds=${universeId}`;
    const data = await fetchData(url);
    if (!data || !data.data || data.data.length === 0) {
      throw new Error(`No game data found for Universe ID ${universeId}`);
    }
    return data.data[0];
  }
  async function getVoteData(universeId) {
    const url = `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`;
    const data = await fetchData(url);
    if (!data || !data.data || data.data.length === 0) {
      throw new Error(`No vote data found for Universe ID ${universeId}`);
    }
    return data.data[0];
  }
  async function getThumbnailUrl(universeId) {
    const url = `https://thumbnails.roproxy.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`;
    const data = await fetchData(url);
    if (!data || !data.data || data.data.length === 0) {
      throw new Error(`No thumbnail data found for Universe ID ${universeId}`);
    }
    const gameData = data.data[0];
    if (!gameData.thumbnails || gameData.thumbnails.length === 0) {
      throw new Error(`No thumbnails found for Universe ID ${universeId}`);
    }
    const imageUrl = gameData.thumbnails[0].imageUrl;
    if (!imageUrl) {
      throw new Error(`No image URL found for Universe ID ${universeId}`);
    }
    return imageUrl;
  }
  async function getUserInfo(userId) {
    const url = `https://users.roblox.com/v1/users/${userId}`;
    const data = await fetchData(url);
    if (!data || !data.name) {
      throw new Error(`No user data found for User ID ${userId}`);
    }
    return data;
  }
  async function getUserAvatarUrl(userId) {
    const url = `https://thumbnails.roproxy.com/v1/users/avatar?userIds=${userId}&size=150x150&format=Png`;
    const data = await fetchData(url);
    if (!data || !data.data || data.data.length === 0) {
      return "No avatar available";
    }
    return data.data[0].imageUrl || "No avatar available";
  }
  async function getGameDetails(universeId) {
    try {
      const url = `https://games.roproxy.com/v1/games/multiget-place-details?universeIds=${universeId}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Unable to fetch game details: ${response.status}`);
        return null;
      }
      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error("Error fetching game details:", error);
      return null;
    }
  }
  async function getGameBadges(universeId) {
    try {
      const url = `https://badges.roproxy.com/v1/universes/${universeId}/badges?limit=10&sortOrder=Asc`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Unable to fetch badges: ${response.status}`);
        return [];
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching badges:", error);
      return [];
    }
  }
  app2.get("/api/roblox/game/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;
      if (!placeId || !/^\d+$/.test(placeId)) {
        return res.status(400).json({
          message: "Invalid Place ID. Please provide a valid numeric Place ID."
        });
      }
      const universeId = await getUniverseIdFromPlaceId(placeId);
      const [gameData, voteData, thumbnailUrl, gameDetails, badges2] = await Promise.all([
        getGameData(universeId),
        getVoteData(universeId),
        getThumbnailUrl(universeId),
        getGameDetails(universeId),
        getGameBadges(universeId)
      ]);
      const creatorId = gameData.creator.id;
      const [_, creatorAvatarUrl] = await Promise.all([
        getUserInfo(creatorId),
        // We already have the name from gameData
        getUserAvatarUrl(creatorId)
      ]);
      const upVotes = voteData.upVotes;
      const downVotes = voteData.downVotes;
      const totalVotes = upVotes + downVotes;
      const likeRatio = totalVotes > 0 ? Math.round(upVotes / totalVotes * 100).toString() : "0";
      const formattedBadges = badges2.map((badge) => ({
        id: badge.id.toString(),
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        enabled: badge.enabled,
        statistics: badge.statistics ? {
          awardedCount: badge.statistics.awardedCount,
          winRate: badge.statistics.winRatePercentage
        } : void 0
      }));
      const result = {
        place_id: placeId,
        universe_id: universeId,
        name: gameData.name,
        playing: gameData.playing.toString(),
        visits: gameData.visits.toString(),
        favoritedCount: gameData.favoritedCount.toString(),
        upVotes: voteData.upVotes.toString(),
        downVotes: voteData.downVotes.toString(),
        thumbnail_url: thumbnailUrl,
        creator_name: gameData.creator.name,
        creator_avatar_url: creatorAvatarUrl,
        likeRatio,
        badges: formattedBadges,
        description: gameDetails?.description || "No description available",
        created: gameDetails?.created,
        updated: gameDetails?.updated,
        maxPlayers: gameDetails?.maxPlayers?.toString() || "Unknown",
        genre: gameDetails?.genre || "Unknown"
      };
      try {
        await storage.saveSearchHistory({
          placeId,
          name: gameData.name,
          thumbnail: thumbnailUrl,
          searchedAt: /* @__PURE__ */ new Date()
        });
      } catch (dbError) {
        console.error("Error saving search history:", dbError);
      }
      try {
        for (const badge of formattedBadges) {
          await storage.saveBadge({
            id: badge.id,
            gameId: universeId,
            name: badge.name,
            description: badge.description,
            imageUrl: badge.imageUrl,
            enabled: badge.enabled,
            awardedCount: badge.statistics?.awardedCount,
            winRate: badge.statistics?.winRate
          });
        }
      } catch (badgeError) {
        console.error("Error saving badges:", badgeError);
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching game data:", error);
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  });
  app2.get("/api/search-history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const history = await storage.getSearchHistory(void 0, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });
  app2.delete("/api/search-history", async (req, res) => {
    try {
      await storage.clearSearchHistory();
      res.json({ message: "Search history cleared successfully" });
    } catch (error) {
      console.error("Error clearing search history:", error);
      res.status(500).json({ message: "Failed to clear search history" });
    }
  });
  app2.delete("/api/search-history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      await storage.deleteSearchHistory(id);
      res.json({ message: "Search history item deleted successfully" });
    } catch (error) {
      console.error("Error deleting search history item:", error);
      res.status(500).json({ message: "Failed to delete search history item" });
    }
  });
  app2.get("/api/favorites", async (req, res) => {
    try {
      const favorites2 = await storage.getFavorites();
      res.json(favorites2);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    try {
      const { placeId, name, thumbnail, notes } = req.body;
      if (!placeId || !name || !thumbnail) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const favorite = await storage.saveFavorite({
        placeId,
        name,
        thumbnail,
        addedAt: /* @__PURE__ */ new Date(),
        notes
      });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });
  app2.delete("/api/favorites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      await storage.deleteFavorite(id);
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });
  app2.patch("/api/favorites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      if (notes === void 0) {
        return res.status(400).json({ message: "Notes field is required" });
      }
      const updatedFavorite = await storage.updateFavoriteNotes(id, notes);
      res.json(updatedFavorite);
    } catch (error) {
      console.error("Error updating favorite notes:", error);
      res.status(500).json({ message: "Failed to update favorite notes" });
    }
  });
  app2.get("/api/game/:gameId/badges", async (req, res) => {
    try {
      const { gameId } = req.params;
      const badges2 = await storage.getGameBadges(gameId);
      res.json(badges2);
    } catch (error) {
      console.error("Error fetching game badges:", error);
      res.status(500).json({ message: "Failed to fetch game badges" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${port}`);
  });
})();
