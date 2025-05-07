import type { Express } from "express";
import fetch from "node-fetch";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  GameResponse,
  UniverseResponse,
  VoteResponse,
  ThumbnailResponse,
  UserResponse,
  UserThumbnailResponse 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch data from Roblox API
  async function fetchData(url: string) {
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

  // Get universe ID from place ID
  async function getUniverseIdFromPlaceId(placeId: string): Promise<string> {
    const url = `https://apis.roproxy.com/universes/v1/places/${placeId}/universe`;
    const data = await fetchData(url) as UniverseResponse;
    if (!data || !data.universeId) {
      throw new Error(`Failed to get Universe ID for Place ID ${placeId}`);
    }
    return data.universeId;
  }

  // Get game data
  async function getGameData(universeId: string) {
    const url = `https://games.roproxy.com/v1/games?universeIds=${universeId}`;
    const data = await fetchData(url) as GameResponse;
    if (!data || !data.data || data.data.length === 0) {
      throw new Error(`No game data found for Universe ID ${universeId}`);
    }
    return data.data[0];
  }

  // Get vote data
  async function getVoteData(universeId: string) {
    const url = `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`;
    const data = await fetchData(url) as VoteResponse;
    if (!data || !data.data || data.data.length === 0) {
      throw new Error(`No vote data found for Universe ID ${universeId}`);
    }
    return data.data[0];
  }

  // Get thumbnail URL
  async function getThumbnailUrl(universeId: string) {
    const url = `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`;
    const data = await fetchData(url) as ThumbnailResponse;
    
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

  // Get user info
  async function getUserInfo(userId: number) {
    const url = `https://users.roblox.com/v1/users/${userId}`;
    const data = await fetchData(url) as UserResponse;
    if (!data || !data.name) {
      throw new Error(`No user data found for User ID ${userId}`);
    }
    return data;
  }

  // Get user avatar URL
  async function getUserAvatarUrl(userId: number) {
    const url = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=150x150&format=Png`;
    const data = await fetchData(url) as UserThumbnailResponse;
    
    if (!data || !data.data || data.data.length === 0) {
      return "No avatar available";
    }
    
    return data.data[0].imageUrl || "No avatar available";
  }

  // Game details type interface
  interface GameDetailsResponse {
    data: Array<{
      description?: string;
      created?: string;
      updated?: string;
      maxPlayers?: number;
      genre?: string;
    }>;
  }

  // Badge type interface
  interface BadgeResponse {
    data: Array<{
      id: number;
      name: string;
      description: string;
      imageUrl: string;
      enabled: boolean;
      statistics?: {
        awardedCount: number;
        winRatePercentage: number;
      };
    }>;
  }

  // Get game details
  async function getGameDetails(universeId: string) {
    try {
      const url = `https://games.roproxy.com/v1/games/multiget-place-details?universeIds=${universeId}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Unable to fetch game details: ${response.status}`);
        return null;
      }
      const data = await response.json() as GameDetailsResponse;
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error("Error fetching game details:", error);
      return null;
    }
  }

  // Get game badges
  async function getGameBadges(universeId: string) {
    try {
      const url = `https://badges.roproxy.com/v1/universes/${universeId}/badges?limit=10&sortOrder=Asc`;
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Unable to fetch badges: ${response.status}`);
        return [];
      }
      const data = await response.json() as BadgeResponse;
      return data.data || [];
    } catch (error) {
      console.error("Error fetching badges:", error);
      return [];
    }
  }

  // Game data endpoint
  app.get("/api/roblox/game/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;
      
      // Validate place ID
      if (!placeId || !/^\d+$/.test(placeId)) {
        return res.status(400).json({ 
          message: "Invalid Place ID. Please provide a valid numeric Place ID." 
        });
      }

      // First, get universe ID from place ID
      const universeId = await getUniverseIdFromPlaceId(placeId);

      // Then get game data and vote data in parallel
      const [gameData, voteData, thumbnailUrl, gameDetails, badges] = await Promise.all([
        getGameData(universeId),
        getVoteData(universeId),
        getThumbnailUrl(universeId),
        getGameDetails(universeId),
        getGameBadges(universeId)
      ]);

      // Get creator info
      const creatorId = gameData.creator.id;
      const [_, creatorAvatarUrl] = await Promise.all([
        getUserInfo(creatorId),  // We already have the name from gameData
        getUserAvatarUrl(creatorId)
      ]);

      // Calculate like ratio
      const upVotes = voteData.upVotes;
      const downVotes = voteData.downVotes;
      const totalVotes = upVotes + downVotes;
      const likeRatio = totalVotes > 0 ? Math.round((upVotes / totalVotes) * 100).toString() : "0";

      // Format badges
      const formattedBadges = badges.map((badge: BadgeResponse['data'][0]) => ({
        id: badge.id.toString(),
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        enabled: badge.enabled,
        statistics: badge.statistics ? {
          awardedCount: badge.statistics.awardedCount,
          winRate: badge.statistics.winRatePercentage
        } : undefined
      }));

      // Compile all data
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

      // Save search to history (without user ID for now)
      try {
        await storage.saveSearchHistory({
          placeId: placeId,
          name: gameData.name,
          thumbnail: thumbnailUrl,
          searchedAt: new Date()
        });
      } catch (dbError) {
        console.error("Error saving search history:", dbError);
        // Continue with the response even if saving to history fails
      }

      // Save badge information if not already in database
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
        // Continue with the response even if saving badges fails
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

  // Get search history
  app.get("/api/search-history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await storage.getSearchHistory(undefined, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // Clear all search history
  app.delete("/api/search-history", async (req, res) => {
    try {
      await storage.clearSearchHistory();
      res.json({ message: "Search history cleared successfully" });
    } catch (error) {
      console.error("Error clearing search history:", error);
      res.status(500).json({ message: "Failed to clear search history" });
    }
  });

  // Delete a specific search history item
  app.delete("/api/search-history/:id", async (req, res) => {
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

  // Get favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add to favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const { placeId, name, thumbnail, notes } = req.body;
      
      if (!placeId || !name || !thumbnail) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const favorite = await storage.saveFavorite({
        placeId,
        name,
        thumbnail,
        addedAt: new Date(),
        notes
      });
      
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove from favorites
  app.delete("/api/favorites/:id", async (req, res) => {
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

  // Update favorite notes
  app.patch("/api/favorites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      if (notes === undefined) {
        return res.status(400).json({ message: "Notes field is required" });
      }
      
      const updatedFavorite = await storage.updateFavoriteNotes(id, notes);
      res.json(updatedFavorite);
    } catch (error) {
      console.error("Error updating favorite notes:", error);
      res.status(500).json({ message: "Failed to update favorite notes" });
    }
  });

  // Get game badges
  app.get("/api/game/:gameId/badges", async (req, res) => {
    try {
      const { gameId } = req.params;
      const badges = await storage.getGameBadges(gameId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching game badges:", error);
      res.status(500).json({ message: "Failed to fetch game badges" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
