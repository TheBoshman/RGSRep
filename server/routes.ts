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
    const url = `https://thumbnails.roproxy.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`;
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
    const url = `https://thumbnails.roproxy.com/v1/users/avatar?userIds=${userId}&size=150x150&format=Png`;
    const data = await fetchData(url) as UserThumbnailResponse;
    
    if (!data || !data.data || data.data.length === 0) {
      return "No avatar available";
    }
    
    return data.data[0].imageUrl || "No avatar available";
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
      const [gameData, voteData, thumbnailUrl] = await Promise.all([
        getGameData(universeId),
        getVoteData(universeId),
        getThumbnailUrl(universeId)
      ]);

      // Get creator info
      const creatorId = gameData.creator.id;
      const [_, creatorAvatarUrl] = await Promise.all([
        getUserInfo(creatorId),  // We already have the name from gameData
        getUserAvatarUrl(creatorId)
      ]);

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
        creator_avatar_url: creatorAvatarUrl
      };

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

  const httpServer = createServer(app);
  return httpServer;
}
