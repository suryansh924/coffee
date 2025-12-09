import { useState } from "react";
import { ChevronLeft, Send, Mic, MoreVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! Thanks for reaching out. I'd love to grab coffee and chat about astrophysics!",
      sender: "other",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      text: "That's great! How about this Saturday at The Daily Grind?",
      sender: "user",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      text: "That sounds perfect! See you there at 3pm? 😊",
      sender: "other",
      timestamp: new Date(Date.now() - 300000),
    },
  ]);
  const [input, setInput] = useState("");

  // Mock match data
  const match = {
    name: "Anya",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anya",
    online: true,
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={match.avatar} />
              <AvatarFallback>{match.name[0]}</AvatarFallback>
            </Avatar>
            {match.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <h2 className="font-semibold">{match.name}</h2>
            <p className="text-xs text-muted-foreground">
              {match.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button className="p-2">
          <MoreVertical className="w-6 h-6" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-secondary border-0"
          />
          <Button size="icon" variant="ghost" className="shrink-0">
            <Mic className="w-5 h-5" />
          </Button>
          <Button size="icon" onClick={handleSend} className="shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
