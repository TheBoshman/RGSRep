import React from "react";
import { BadgeInfo } from "@/lib/roblox.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import { Badge as BadgeIcon } from "lucide-react";

interface GameBadgesProps {
  badges: BadgeInfo[];
}

export default function GameBadges({ badges }: GameBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-4 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <BadgeIcon className="w-5 h-5 mr-2 text-amber-500" />
          Game Badges
        </CardTitle>
        <CardDescription>Achievements available in this game</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center bg-accent/40 p-4 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <img
                      src={badge.imageUrl}
                      alt={badge.name}
                      className="w-16 h-16 mb-2 rounded-md"
                    />
                    <h3 className="font-medium text-sm text-center line-clamp-1">
                      {badge.name}
                    </h3>
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
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div>
                    <h4 className="font-bold">{badge.name}</h4>
                    <p className="text-sm">{badge.description}</p>
                    {badge.statistics && (
                      <div className="mt-2 text-xs">
                        <div>Awarded: {formatNumber(badge.statistics.awardedCount.toString())}</div>
                        <div>Win Rate: {badge.statistics.winRate}%</div>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}