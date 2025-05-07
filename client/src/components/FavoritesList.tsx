import { useFavorites } from "@/contexts/FavoritesContext";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Heart, Search, X, Pencil, Loader2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FavoritesListProps {
  onSelect: (placeId: string) => void;
}

export default function FavoritesList({ onSelect }: FavoritesListProps) {
  const { favorites, removeFromFavorites, updateFavoriteNotes, isLoading } = useFavorites();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  // Show nothing if no favorites and not loading
  if (favorites.length === 0 && !isLoading) {
    return null;
  }

  const handleEditStart = (id: number, initialText: string = "") => {
    setEditingId(id);
    setEditText(initialText || "");
  };

  const handleEditSave = (id: number) => {
    updateFavoriteNotes(id, editText);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Favorites
            {isLoading && (
              <Loader2 className="w-4 h-4 ml-2 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
        </div>
        <CardDescription>Your saved games</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="favorites">
            <AccordionTrigger>
              View Favorites ({isLoading ? "..." : favorites.length})
            </AccordionTrigger>
            <AccordionContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border rounded-md p-3">
                      <div className="flex items-center mb-2">
                        <Skeleton className="w-12 h-12 rounded-md mr-3" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id || item.placeId}
                      className="border rounded-md p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Added {formatDistanceToNow(new Date(item.addedAt), {
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
                            title="Search again"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStart(item.id, item.notes)}
                            title="Edit notes"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromFavorites(item.id)}
                            className="text-destructive hover:text-destructive"
                            title="Remove from favorites"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingId === item.id ? (
                        <div className="mt-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Add your notes here..."
                            className="w-full mb-2"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditSave(item.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        item.notes && (
                          <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                            <p>{item.notes}</p>
                          </div>
                        )
                      )}
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