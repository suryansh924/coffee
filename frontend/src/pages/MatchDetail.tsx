import { ChevronLeft, Bell, Menu, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const MatchDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data
  const match = {
    name: "Anya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anya",
    conversationScore: 85,
    contexts: [
      {
        title: "You are both small towners having moved to bigger cities to study and crave the comfortable life.",
      },
      {
        title: "You're both navigating parenting and career",
      },
      {
        title: "and Elara has recently started writing a new blog on parenting where she'd love to hear your point of view",
      },
    ],
    recentActivity: {
      text: 'Meeting up with friends for coffee at "The Daily Grind" this afternoon. Anyone else joining?',
      time: "15 mins ago",
    },
    topics: [
      { text: "Andaz Apna Apna", color: "green" },
      { text: "Atlas Shrugged", color: "blue" },
      { text: "The Louvre in Paris", color: "yellow" },
      { text: "AI for Education", color: "purple" },
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Coffee with {match.name}?</h1>
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

      <div className="p-4 space-y-6">
        {/* Conversation Quality */}
        <Card className="p-6 bg-coffee-purple/20 border-coffee-purple space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-4xl font-bold text-primary">{match.conversationScore}%</span>
          </div>
          <h2 className="text-xl font-semibold text-center">
            Chance you'll have a<br />Good Conversation
          </h2>
        </Card>

        {/* Contexts */}
        <div className="space-y-3">
          {match.contexts.map((context, idx) => (
            <p key={idx} className="text-foreground">
              {context.title}
            </p>
          ))}
        </div>

        {/* Recent Contexts */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recent Contexts</h3>
          <Card className="p-4 space-y-2">
            <p className="text-sm text-foreground">{match.recentActivity.text}</p>
            <p className="text-xs text-muted-foreground">{match.recentActivity.time}</p>
          </Card>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Feel Free to Bring Up</h3>
          <div className="grid grid-cols-2 gap-2">
            {match.topics.map((topic, idx) => (
              <Badge
                key={idx}
                className={`bg-coffee-${topic.color} text-foreground border-0 py-3 justify-center text-sm`}
              >
                {topic.text}
              </Badge>
            ))}
          </div>
        </div>

        {/* Chat Button */}
        <Button
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base"
          onClick={() => navigate(`/chat/${id}`)}
        >
          Chat Now
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default MatchDetail;
