import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FavoriteGame, GameStats } from '@/lib/roblox.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Context interface
interface FavoritesContextType {
  favorites: FavoriteGame[];
  addToFavorites: (game: GameStats) => void;
  removeFromFavorites: (id: number) => void;
  isGameFavorited: (placeId: string) => boolean;
  updateFavoriteNotes: (id: number, notes: string) => void;
  isLoading: boolean;
}

// Interface for API favorites
interface ApiFavorite {
  id: number;
  placeId: string;
  name: string;
  thumbnail: string;
  addedAt: string;
  notes?: string;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider component
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const queryClient = useQueryClient();
  
  // Fetch favorites from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/favorites'],
    select: (data: ApiFavorite[]) => {
      return data.map(item => ({
        id: item.id,
        placeId: item.placeId,
        name: item.name,
        thumbnail: item.thumbnail,
        addedAt: new Date(item.addedAt),
        notes: item.notes
      }));
    }
  });
  
  // Update state when data changes
  useEffect(() => {
    if (data) {
      setFavorites(data);
    }
  }, [data]);
  
  // Add a game to favorites
  const addFavoriteMutation = useMutation({
    mutationFn: async (game: GameStats) => {
      await apiRequest('POST', '/api/favorites', {
        placeId: game.place_id,
        name: game.name,
        thumbnail: game.thumbnail_url
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    }
  });
  
  // Remove from favorites
  const removeFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    }
  });
  
  // Update favorite notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      await apiRequest('PATCH', `/api/favorites/${id}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    }
  });

  // Add a game to favorites
  const addToFavorites = (game: GameStats) => {
    // Check if already in favorites
    if (isGameFavorited(game.place_id)) return;
    
    // Add to favorites through API
    addFavoriteMutation.mutate(game);
  };

  // Remove a game from favorites by ID
  const removeFromFavorites = (id: number) => {
    removeFavoriteMutation.mutate(id);
  };

  // Check if a game is in favorites
  const isGameFavorited = (placeId: string): boolean => {
    return favorites.some(item => item.placeId === placeId);
  };

  // Update notes for a favorited game
  const updateFavoriteNotes = (id: number, notes: string) => {
    updateNotesMutation.mutate({ id, notes });
  };

  // Context value
  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isGameFavorited,
    updateFavoriteNotes,
    isLoading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook to use the favorites context
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}