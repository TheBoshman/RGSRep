import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearch: (placeId: string) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [placeId, setPlaceId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input is numeric only
    if (!placeId || !/^\d+$/.test(placeId)) {
      setError("Please enter a valid Roblox Place ID (numbers only)");
      return;
    }
    
    setError(null);
    onSearch(placeId);
  };

  const handleExampleClick = (id: string) => {
    setPlaceId(id);
    setError(null);
    onSearch(id);
  };

  return (
    <section className="max-w-2xl mx-auto mb-12">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-[#232527] mb-4">Enter a Roblox Game ID</h2>
          <p className="text-[#393B3D] mb-6">Get comprehensive statistics about any Roblox game by entering its Place ID.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <Input
                type="text"
                value={placeId}
                onChange={(e) => {
                  setPlaceId(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. 920587237"
                className="w-full px-4 py-6 border border-gray-300 focus:ring-[#0D72EF]"
              />
              {error && (
                <p className="text-[#FF3C41] text-sm mt-1">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="bg-[#0D72EF] hover:bg-[#00A2FF] text-white px-6 h-12"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-[#393B3D]">
            <p>
              Not sure where to find the Place ID? 
              <Button 
                variant="link" 
                className="text-[#0D72EF] p-0 h-auto font-normal"
                onClick={() => {
                  toast({
                    title: "How to find a Roblox Place ID",
                    description: "Go to the game's page on Roblox.com. The Place ID is the number in the URL after 'games/'.",
                  });
                }}
              >
                Learn how
              </Button>
            </p>
            <p className="mt-1">
              Try these examples: 
              <Button 
                variant="link" 
                className="text-[#0D72EF] p-0 h-auto font-normal"
                onClick={() => handleExampleClick("920587237")}
              >
                920587237
              </Button>, 
              <Button 
                variant="link" 
                className="text-[#0D72EF] p-0 h-auto font-normal"
                onClick={() => handleExampleClick("4924922222")}
              >
                4924922222
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
