import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface Match {
  user_id: string;
  name: string;
  age?: number;
  city?: string;
  score?: number;
  match_reason?: string;
}

interface MatchesWidgetProps {
  matches: Match[];
  headline?: string;
  onClose: () => void;
  onOpenProfile: (userId: string) => void;
  onOpenChat: (userId: string) => void;
}

export const MatchesWidget: React.FC<MatchesWidgetProps> = ({
  matches,
  headline,
  onClose,
  onOpenProfile,
  onOpenChat,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background border-t rounded-t-xl shadow-lg z-50 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-muted/20 rounded-t-xl">
        <h3 className="font-semibold text-lg">
          {headline || "People you might vibe with"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-8">
          {matches.map((match) => (
            <Card key={match.user_id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg">
                      {match.name}, {match.age}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {match.city}
                    </p>
                  </div>
                  {match.score !== undefined && (
                    <Badge
                      variant="secondary"
                      className="bg-violet-100 text-violet-700 hover:bg-violet-200"
                    >
                      {Math.round(match.score * 100)}% Match
                    </Badge>
                  )}
                </div>

                {match.match_reason && (
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{match.match_reason}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                    onClick={() => onOpenProfile(match.user_id)}
                  >
                    View Profile
                  </Button>
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={() => onOpenChat(match.user_id)}
                  >
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
