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
