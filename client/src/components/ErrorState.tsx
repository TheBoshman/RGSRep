import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onTryAgain: () => void;
}

export default function ErrorState({ message, onTryAgain }: ErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-[#FF3C41] mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-[#232527] mb-3">Game Data Not Found</h2>
            <p className="text-[#393B3D] mb-6">
              {message}
            </p>
            <Button 
              onClick={onTryAgain}
              className="bg-[#0D72EF] hover:bg-[#00A2FF] text-white"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
