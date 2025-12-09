import { Bell, Menu, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const mockMatches = [
  {
    id: "1",
    name: "Liam",
    availability: "Weekends Only",
    matchScore: 70,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    bio: "Liam shares specific intellectual hobbies. The conversation starter focuses on a deep, shared academic interest.",
    interests: ["Coding", "Board Games", "Astrophysics"],
    interestColors: ["green", "blue", "purple"],
    conversationStarter: "Liam, your interest in astrophysics is fascinating! Have you read any good books on black holes recently?",
  },
  {
    id: "2",
    name: "Anya",
    availability: "Available This Sat",
    matchScore: 92,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anya",
    bio: "Elara shares many interests and has a compatible schedule, making for a smooth and engaging initial conversation.",
    interests: ["Sci-Fi Books", "Hiking", "AI Ethics"],
    interestColors: ["green", "blue", "purple"],
    conversationStarter: "Curious about your favorite trail, Elara! Any recommendations for a beginner?",
  },
];

const Discover = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Discover</h1>
        <div className="flex items-center gap-2">
          <button className="relative p-2">
            <Bell className="w-6 h-6" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
              3
            </Badge>
          </button>
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="w-2 h-2 bg-green-500 rounded-full absolute translate-x-7 translate-y-3" />
          <button className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Match Cards */}
      <div className="p-4 space-y-4">
        {mockMatches.map((match) => (
          <Card
            key={match.id}
            className="p-6 space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/match/${match.id}`)}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={match.avatar} />
                  <AvatarFallback>{match.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{match.name}</h3>
                  <p className="text-sm text-muted-foreground">{match.availability}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-coffee-purple px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{match.matchScore}%</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-foreground">{match.bio}</p>

            {/* Shared Interests */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Shared Interests</p>
              <div className="flex flex-wrap gap-2">
                {match.interests.map((interest, idx) => (
                  <Badge
                    key={interest}
                    className={`bg-coffee-${match.interestColors[idx]} text-foreground border-0`}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Conversation Starter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Conversation Starter</p>
              <p className="text-sm text-foreground">{match.conversationStarter}</p>
            </div>

            {/* Action Button */}
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Say Hello
            </Button>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Discover;
