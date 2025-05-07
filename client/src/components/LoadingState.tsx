import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className="max-w-5xl mx-auto">
      <Card className="shadow-md mb-8">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Skeleton className="h-24 w-40 rounded-lg" />
            <div className="ml-6 flex-grow">
              <Skeleton className="h-8 w-3/4 rounded mb-3" />
              <Skeleton className="h-5 w-1/2 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-1/3 rounded mb-4" />
              <Skeleton className="h-10 w-1/2 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
