import { createContext, useContext, ReactNode } from 'react';
import { FavoriteGame, GameStats } from '@/lib/roblox.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Context interface
interface FavoritesContextType {
  favorites: FavoriteGame[];
  addToFavorites: (game: GameStats) => void;
  removeFromFavorites: (placeId: string) => void;
  isGameFavorited: (placeId: string) => boolean;
  updateFavoriteNotes: (placeId: string, notes: string) => void;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider component
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<FavoriteGame[]>(
    'roblox-game-stats-favorites',
    []
  );

  // Add a game to favorites
  const addToFavorites = (game: GameStats) => {
    // Check if already in favorites
    if (isGameFavorited(game.place_id)) return;
    
    // Create a new favorite item
    const newFavorite: FavoriteGame = {
      placeId: game.place_id,
      name: game.name,
      thumbnail: game.thumbnail_url,
      addedAt: new Date(),
    };
    
    // Add to favorites
    setFavorites(prevFavorites => [...prevFavorites, newFavorite]);
  };

  // Remove a game from favorites
  const removeFromFavorites = (placeId: string) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(item => item.placeId !== placeId)
    );
  };

  // Check if a game is in favorites
  const isGameFavorited = (placeId: string): boolean => {
    return favorites.some(item => item.placeId === placeId);
  };

  // Update notes for a favorited game
  const updateFavoriteNotes = (placeId: string, notes: string) => {
    setFavorites(prevFavorites => 
      prevFavorites.map(item => 
        item.placeId === placeId 
          ? { ...item, notes } 
          : item
      )
    );
  };

  // Context value
  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isGameFavorited,
    updateFavoriteNotes
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