import { useState } from "react";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import GameResults from "@/components/GameResults";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import Footer from "@/components/Footer";
import SearchHistory from "@/components/SearchHistory";
import FavoritesList from "@/components/FavoritesList";
import CompareGames from "@/components/CompareGames";
import { useQuery } from "@tanstack/react-query";
import { GameStats } from "@/lib/roblox.types";
import { useCompare } from "@/contexts/CompareContext";

export default function Home() {
  const [placeId, setPlaceId] = useState<string>("");
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const { comparedGames } = useCompare();
  
  const { 
    data: gameData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery<GameStats>({
    queryKey: [`/api/roblox/game/${placeId}`],
    enabled: isSearchSubmitted && !!placeId,
    retry: 1,
  });

  const handleSearch = (id: string) => {
    setPlaceId(id);
    setIsSearchSubmitted(true);
  };

  const handleNewSearch = () => {
    setIsSearchSubmitted(false);
    setPlaceId("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F4F5]">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        {!isSearchSubmitted && (
          <>
            <SearchForm onSearch={handleSearch} />
            <SearchHistory onSelect={handleSearch} />
            <FavoritesList onSelect={handleSearch} />
          </>
        )}
        
        {isSearchSubmitted && isLoading && (
          <LoadingState />
        )}
        
        {isSearchSubmitted && isError && (
          <ErrorState 
            message={error instanceof Error ? error.message : "Failed to fetch game data. Please try again."} 
            onTryAgain={() => refetch()} 
          />
        )}
        
        {isSearchSubmitted && !isLoading && !isError && gameData && (
          <>
            <GameResults 
              gameData={gameData} 
              onNewSearch={handleNewSearch} 
            />
            {comparedGames.length > 0 && <CompareGames />}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
