import { useSearchHistory } from "@/contexts/SearchHistoryContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { X, Clock, Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchHistoryProps {
  onSelect: (placeId: string) => void;
}

export default function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { searchHistory, clearHistory, removeFromHistory, isLoading } = useSearchHistory();

  // Show nothing if there's no history and we're not loading
  if (searchHistory.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Search History
            {isLoading && (
              <Loader2 className="w-4 h-4 ml-2 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground"
            disabled={isLoading || searchHistory.length === 0}
          >
            Clear All
          </Button>
        </div>
        <CardDescription>Your recent searches</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="history">
            <AccordionTrigger>
              View History ({isLoading ? "..." : searchHistory.length})
            </AccordionTrigger>
            <AccordionContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-2">
                      <Skeleton className="w-10 h-10 rounded-md mr-3" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id || item.placeId}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.searchedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelect(item.placeId)}
                          className="h-7 w-7"
                          title="Search again"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromHistory(item.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Remove from history"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}