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
  created?: string;
  updated?: string;
  description?: string;
  maxPlayers?: string;
  genre?: string;
  likeRatio?: string;
  badges?: BadgeInfo[];
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
  statistics?: {
    awardedCount: number;
    winRate: number;
  };
}

export interface SearchHistoryItem {
  id?: number;
  placeId: string;
  name: string;
  thumbnail: string;
  searchedAt: Date;
}

export interface GameAnalytics {
  dailyVisits: number[];
  dailyPlayers: number[];
  revenueEstimate?: number;
  dateLabels: string[];
}

export interface FavoriteGame {
  id?: number;
  placeId: string;
  name: string;
  thumbnail: string;
  addedAt: Date;
  notes?: string;
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
