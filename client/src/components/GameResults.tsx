import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameStats } from "@/lib/roblox.types";
import { formatNumber } from "@/lib/utils";
import { Gamepad, Search, Users, LineChart, Heart, Star, Scale, Info, Badge } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { useSearchHistory } from "@/contexts/SearchHistoryContext";
import { useToast } from "@/hooks/use-toast";

interface GameResultsProps {
  gameData: GameStats;
  onNewSearch: () => void;
}

export default function GameResults({ gameData, onNewSearch }: GameResultsProps) {
  const { addToFavorites, isGameFavorited, removeFromFavorites } = useFavorites();
  const { addToCompare, isInCompare, removeFromCompare, isCompareLimit } = useCompare();
  const { addToHistory } = useSearchHistory();
  const { toast } = useToast();

  // Add to search history when results are shown
  useEffect(() => {
    if (gameData) {
      addToHistory(gameData);
    }
  }, [gameData, addToHistory]);

  const handleAddToFavorites = () => {
    if (isGameFavorited(gameData.place_id)) {
      removeFromFavorites(gameData.place_id);
      toast({
        title: "Removed from favorites",
        description: `${gameData.name} has been removed from your favorites`,
      });
    } else {
      addToFavorites(gameData);
      toast({
        title: "Added to favorites",
        description: `${gameData.name} has been added to your favorites`,
      });
    }
  };

  const handleCompare = () => {
    if (isInCompare(gameData.place_id)) {
      removeFromCompare(gameData.place_id);
      toast({
        title: "Removed from comparison",
        description: `${gameData.name} has been removed from comparison`,
      });
    } else {
      const success = addToCompare(gameData);
      if (success) {
        toast({
          title: "Added to comparison",
          description: `${gameData.name} has been added to comparison`,
        });
      } else {
        toast({
          title: "Comparison limit reached",
          description: "You can compare up to 4 games at a time. Remove a game to add another.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Game Header */}
      <Card className="shadow-md mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Game Thumbnail */}
            <div className="w-full md:w-64 h-40 bg-[#F2F4F5] rounded-lg overflow-hidden mb-4 md:mb-0">
              <img 
                src={gameData.thumbnail_url} 
                alt={`${gameData.name} Thumbnail`} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Game Details */}
            <div className="md:ml-6 flex-grow">
              <h2 className="text-2xl font-bold text-[#232527] mb-2">{gameData.name}</h2>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-4 h-4 text-green-500 mr-1"
                  >
                    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.977a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                  </svg>
                  <span>{formatNumber(gameData.upVotes)}</span>
                </div>
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-4 h-4 text-[#FF3C41] mr-1"
                  >
                    <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672V21.25a.75.75 0 0 1-.75.75 2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.836 1.375 1.315 2.985 1.315 4.705 0 1.41-.324 2.75-.923 3.945-.247.394.034.954.5.954h1.051c.832 0 1.612-.453 1.918-1.227Z" />
                  </svg>
                  <span>{formatNumber(gameData.downVotes)}</span>
                </div>
              </div>
              
              {/* Creator Info */}
              <div className="flex items-center">
                <img 
                  src={gameData.creator_avatar_url} 
                  alt={`${gameData.creator_name} Avatar`} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#00A2FF]"
                />
                <div className="ml-3">
                  <p className="text-sm text-[#393B3D]">Created by</p>
                  <p className="font-medium text-[#232527]">{gameData.creator_name}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Players */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <p className="text-[#393B3D] font-medium mb-2">Active Players</p>
            <div className="flex items-center">
              <Users className="text-[#0D72EF] mr-3" size={24} />
              <p className="text-3xl font-bold text-[#232527]">{formatNumber(gameData.playing)}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Visits */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <p className="text-[#393B3D] font-medium mb-2">Total Visits</p>
            <div className="flex items-center">
              <LineChart className="text-[#0D72EF] mr-3" size={24} />
              <p className="text-3xl font-bold text-[#232527]">{formatNumber(gameData.visits)}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Favorites */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <p className="text-[#393B3D] font-medium mb-2">Favorites</p>
            <div className="flex items-center">
              <Heart className="text-[#FF3C41] mr-3" size={24} />
              <p className="text-3xl font-bold text-[#232527]">{formatNumber(gameData.favoritedCount)}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Game ID */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <p className="text-[#393B3D] font-medium mb-2">Game IDs</p>
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <span className="text-[#393B3D] mr-2">Place ID:</span>
                <span className="font-medium text-[#232527]">{gameData.place_id}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#393B3D] mr-2">Universe ID:</span>
                <span className="font-medium text-[#232527]">{gameData.universe_id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button 
          asChild
          className="bg-[#0D72EF] hover:bg-[#00A2FF] text-white h-12"
        >
          <a href={`https://www.roblox.com/games/${gameData.place_id}`} target="_blank" rel="noopener noreferrer">
            <Gamepad className="mr-2 h-5 w-5" />
            Visit Game on Roblox
          </a>
        </Button>
        <Button 
          variant="outline"
          className="h-12 border border-gray-300"
          onClick={onNewSearch}
        >
          <Search className="mr-2 h-5 w-5" />
          Search Another Game
        </Button>
      </div>
      
      {/* Additional Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button 
          variant={isGameFavorited(gameData.place_id) ? "default" : "outline"}
          className={`h-12 ${isGameFavorited(gameData.place_id) ? "bg-red-500 hover:bg-red-600" : "border-red-300 text-red-500 hover:text-red-600"}`}
          onClick={handleAddToFavorites}
        >
          <Star className="mr-2 h-5 w-5" />
          {isGameFavorited(gameData.place_id) ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
        <Button 
          variant={isInCompare(gameData.place_id) ? "default" : "outline"}
          className={`h-12 ${isInCompare(gameData.place_id) ? "bg-purple-500 hover:bg-purple-600" : "border-purple-300 text-purple-500 hover:text-purple-600"}`}
          onClick={handleCompare}
        >
          <Scale className="mr-2 h-5 w-5" />
          {isInCompare(gameData.place_id) ? "Remove from Comparison" : "Add to Comparison"}
        </Button>
      </div>
      
      {/* Game Description */}
      {gameData.description && gameData.description !== "No description available" && (
        <Card className="shadow-md mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Info className="mr-2 h-5 w-5 text-[#0D72EF]" />
              Description
            </h3>
            <p className="text-[#393B3D] whitespace-pre-wrap">{gameData.description}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Game Badges Display */}
      {gameData.badges && gameData.badges.length > 0 && (
        <div className="mt-6">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Badge className="mr-2 h-5 w-5 text-amber-500" />
                Game Badges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gameData.badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="bg-accent/40 p-3 rounded-lg flex flex-col items-center hover:bg-accent"
                  >
                    <img 
                      src={badge.imageUrl} 
                      alt={badge.name}
                      className="w-16 h-16 mb-2 rounded"
                    />
                    <h4 className="font-medium text-sm text-center">{badge.name}</h4>
                    {badge.statistics && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Awarded: {formatNumber(badge.statistics.awardedCount.toString())}
                      </p>
                    )}
                    {!badge.enabled && (
                      <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                        Disabled
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
