import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { PageLoader } from "@/components/Loader";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { id: matchId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [matchProfile, setMatchProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);

      // Fetch match profile
      const { data: profile } = await supabase
        .from("users")
        .select("name, user_id")
        .eq("user_id", matchId)
        .single();
      setMatchProfile(profile);

      // Fetch existing messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${session.user.id},receiver_id.eq.${matchId}),and(sender_id.eq.${matchId},receiver_id.eq.${session.user.id})`
        )
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs);

      // Subscribe to new messages
      const channel = supabase
        .channel(`chat:${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (payload.new.sender_id === matchId) {
              setMessages((prev) => [...prev, payload.new as Message]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [matchId, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUserId || !matchId) return;

    const text = input.trim();
    setInput(""); // Optimistic clear

    // Optimistic update
    const tempId = Math.random().toString();
    const optimisticMsg: Message = {
      id: tempId,
      content: text,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: matchId,
      content: text,
    });

    if (error) {
      console.error("Error sending message:", error);
      // Rollback if needed (omitted for brevity)
    }
  };

  if (!matchProfile) return <PageLoader />;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${matchProfile.user_id}`}
          />
          <AvatarFallback>{matchProfile.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-semibold">{matchProfile.name}</h1>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-[10px] opacity-70 mt-1 block">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
