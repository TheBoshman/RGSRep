import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { SearchHistoryItem, GameStats } from '@/lib/roblox.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Maximum number of items to keep in search history
const MAX_SEARCH_HISTORY = 20;

// Context interface
interface SearchHistoryContextType {
  searchHistory: SearchHistoryItem[];
  addToHistory: (game: GameStats) => void;
  clearHistory: () => void;
  removeFromHistory: (id: number | undefined) => void;
  isLoading: boolean;
}

// Create the context
const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

// Provider component
export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const queryClient = useQueryClient();
  
  // Fetch search history from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/search-history'],
    select: (data: any[]) => {
      return data.map(item => ({
        id: item.id,
        placeId: item.placeId,
        name: item.name,
        thumbnail: item.thumbnail,
        searchedAt: new Date(item.searchedAt)
      }));
    }
  });
  
  // Update state when data changes, but only if it's different
  useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(searchHistory)) {
      setSearchHistory(data);
    }
  }, [data, JSON.stringify(data)]);
  
  // Clear all search history
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/search-history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/search-history'] });
    }
  });
  
  // Remove a specific search history item
  const removeHistoryItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/search-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/search-history'] });
    }
  });
  
  // Add a game to search history (just for context API consistency)
  // Note: The actual saving happens in the server when fetching game data
  const addToHistory = (game: GameStats) => {
    // This is now handled automatically by the server when a game is fetched
    // We'll manually update the client-side cache only if needed
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/search-history'] });
    }, 500);
  };
  
  const clearHistory = () => {
    clearHistoryMutation.mutate();
  };
  
  const removeFromHistory = (id: number | undefined) => {
    if (id !== undefined) {
      removeHistoryItemMutation.mutate(id);
    }
  };
  
  // Context value
  const value = {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
    isLoading
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