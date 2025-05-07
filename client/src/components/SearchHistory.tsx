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
import { X, Clock, Search } from "lucide-react";

interface SearchHistoryProps {
  onSelect: (placeId: string) => void;
}

export default function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { searchHistory, clearHistory, removeFromHistory } = useSearchHistory();

  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Search History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground"
          >
            Clear All
          </Button>
        </div>
        <CardDescription>Your recent searches</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="history">
            <AccordionTrigger>View History ({searchHistory.length})</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.placeId}
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
                        onClick={() => removeFromHistory(item.placeId)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Remove from history"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}