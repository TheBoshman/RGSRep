import { useCompare } from "@/contexts/CompareContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { BarChart, Scale, Trash, Users, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function CompareGames() {
  const { comparedGames, removeFromCompare, clearCompare } = useCompare();

  if (comparedGames.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            Game Comparison
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="text-muted-foreground"
          >
            Clear All
          </Button>
        </div>
        <CardDescription>Compare stats between games</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <ScrollArea className="w-full whitespace-nowrap">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium border-b sticky left-0 bg-background min-w-[150px]">
                    Game
                  </th>
                  {comparedGames.map((game) => (
                    <th key={game.place_id} className="p-2 text-center border-b min-w-[180px]">
                      <div className="relative">
                        <div className="flex flex-col items-center">
                          <img
                            src={game.thumbnail_url}
                            alt={game.name}
                            className="w-16 h-16 rounded-md object-cover mx-auto mb-2"
                          />
                          <span className="font-medium text-xs line-clamp-2 h-10">
                            {game.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCompare(game.place_id)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border"
                          title="Remove from comparison"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Players Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Players
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center border-b">
                      {formatNumber(game.playing)}
                    </td>
                  ))}
                </tr>
                
                {/* Visits Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Total Visits
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center border-b">
                      {formatNumber(game.visits)}
                    </td>
                  ))}
                </tr>
                
                {/* Favorites Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17.75L5.82802 20.995L7.00702 14.122L2.00702 9.25495L8.90702 8.25495L11.993 2.00195L15.079 8.25495L21.979 9.25495L16.979 14.122L18.158 20.995L12 17.75Z" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Favorites
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center border-b">
                      {formatNumber(game.favoritedCount)}
                    </td>
                  ))}
                </tr>
                
                {/* Upvotes Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upvotes
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center border-b">
                      {formatNumber(game.upVotes)}
                    </td>
                  ))}
                </tr>
                
                {/* Downvotes Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Downvotes
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center border-b">
                      {formatNumber(game.downVotes)}
                    </td>
                  ))}
                </tr>
                
                {/* Like Ratio Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Like Ratio
                  </td>
                  {comparedGames.map((game) => {
                    // Calculate like ratio if not provided
                    const upVotes = parseInt(game.upVotes);
                    const downVotes = parseInt(game.downVotes);
                    const ratio = upVotes + downVotes > 0 
                      ? Math.round((upVotes / (upVotes + downVotes)) * 100) 
                      : 0;
                      
                    return (
                      <td key={game.place_id} className="p-2 text-center border-b">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${ratio}%` }}
                            ></div>
                          </div>
                          <span>{ratio}%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                
                {/* Creator Row */}
                <tr>
                  <td className="p-2 border-b sticky left-0 bg-background font-medium">
                    Creator
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center border-b">
                      <div className="flex items-center justify-center space-x-2">
                        <img 
                          src={game.creator_avatar_url} 
                          alt={game.creator_name}
                          className="w-5 h-5 rounded-full" 
                        />
                        <span>{game.creator_name}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                
                {/* ID Row */}
                <tr>
                  <td className="p-2 sticky left-0 bg-background font-medium">
                    Place ID
                  </td>
                  {comparedGames.map((game) => (
                    <td key={game.place_id} className="p-2 text-center">
                      {game.place_id}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}