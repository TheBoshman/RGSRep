import { createContext, useContext, ReactNode } from 'react';
import { SearchHistoryItem, GameStats } from '@/lib/roblox.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Maximum number of items to keep in search history
const MAX_SEARCH_HISTORY = 20;

// Context interface
interface SearchHistoryContextType {
  searchHistory: SearchHistoryItem[];
  addToHistory: (game: GameStats) => void;
  clearHistory: () => void;
  removeFromHistory: (placeId: string) => void;
}

// Create the context
const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

// Provider component
export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistoryItem[]>(
    'roblox-game-stats-history',
    []
  );

  // Add a game to search history
  const addToHistory = (game: GameStats) => {
    setSearchHistory(prevHistory => {
      // First, remove the game if it already exists to avoid duplicates
      const filteredHistory = prevHistory.filter(item => item.placeId !== game.place_id);
      
      // Create a new history item
      const newItem: SearchHistoryItem = {
        placeId: game.place_id,
        name: game.name,
        thumbnail: game.thumbnail_url,
        searchedAt: new Date()
      };
      
      // Add the new item to the beginning of the array
      const newHistory = [newItem, ...filteredHistory];
      
      // Keep only the most recent MAX_SEARCH_HISTORY items
      return newHistory.slice(0, MAX_SEARCH_HISTORY);
    });
  };

  // Clear all search history
  const clearHistory = () => setSearchHistory([]);

  // Remove a specific game from search history
  const removeFromHistory = (placeId: string) => {
    setSearchHistory(prevHistory => 
      prevHistory.filter(item => item.placeId !== placeId)
    );
  };

  // Context value
  const value = {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  };

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
}

// Custom hook to use the search history context
export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
}