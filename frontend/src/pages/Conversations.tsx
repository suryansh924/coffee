import { Bell, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const mockConversations = [
  {
    id: "1",
    name: "Anya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anya",
    lastMessage: "That sounds great! See you there 😊",
    timestamp: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Liam",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    lastMessage: "I'd love to discuss that book you mentioned",
    timestamp: "1h ago",
    unread: 0,
    online: false,
  },
];

const Conversations = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="space-y-4 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Conversations</h1>
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
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-secondary border-0"
          />
        </div>
      </header>

      {/* Conversation List */}
      <div className="divide-y divide-border">
        {mockConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className="p-4 rounded-none border-0 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => navigate(`/chat/${conversation.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                </Avatar>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">{conversation.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {conversation.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center bg-primary text-primary-foreground">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Conversations;
