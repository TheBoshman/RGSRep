import { createContext, useContext, ReactNode, useState } from 'react';
import { GameStats } from '@/lib/roblox.types';

// Maximum number of games that can be compared at once
const MAX_COMPARE_GAMES = 4;

// Context interface
interface CompareContextType {
  comparedGames: GameStats[];
  addToCompare: (game: GameStats) => boolean;
  removeFromCompare: (placeId: string) => void;
  clearCompare: () => void;
  isInCompare: (placeId: string) => boolean;
  isCompareLimit: () => boolean;
}

// Create the context
const CompareContext = createContext<CompareContextType | undefined>(undefined);

// Provider component
export function CompareProvider({ children }: { children: ReactNode }) {
  const [comparedGames, setComparedGames] = useState<GameStats[]>([]);

  // Add a game to compare list
  const addToCompare = (game: GameStats): boolean => {
    // Check if already at maximum
    if (comparedGames.length >= MAX_COMPARE_GAMES) {
      return false;
    }
    
    // Check if already in compare list
    if (isInCompare(game.place_id)) {
      return true;
    }
    
    // Add to compare list
    setComparedGames(prev => [...prev, game]);
    return true;
  };

  // Remove a game from compare list
  const removeFromCompare = (placeId: string) => {
    setComparedGames(prev => 
      prev.filter(game => game.place_id !== placeId)
    );
  };

  // Clear all games from compare list
  const clearCompare = () => {
    setComparedGames([]);
  };

  // Check if a game is in the compare list
  const isInCompare = (placeId: string): boolean => {
    return comparedGames.some(game => game.place_id === placeId);
  };

  // Check if compare limit is reached
  const isCompareLimit = (): boolean => {
    return comparedGames.length >= MAX_COMPARE_GAMES;
  };

  // Context value
  const value = {
    comparedGames,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    isCompareLimit
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

// Custom hook to use the compare context
export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}