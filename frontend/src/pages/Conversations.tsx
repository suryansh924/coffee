import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch all messages involving the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
        return;
      }

      // Group by conversation partner
      const conversationMap = new Map();

      for (const msg of messages || []) {
        const otherId =
          msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(otherId)) {
          conversationMap.set(otherId, {
            lastMessage: msg.content,
            timestamp: msg.created_at,
            unread: 0, // TODO: Implement read status
            otherId: otherId,
          });
        }
      }

      // Fetch details for all partners
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("user_id, name")
          .in("user_id", partnerIds);

        const userMap = new Map(users?.map((u) => [u.user_id, u]));

        const formattedConversations = partnerIds.map((id) => {
          const conv = conversationMap.get(id);
          const user = userMap.get(id);
          return {
            id: id,
            name: user?.name || "Unknown User",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
            lastMessage: conv.lastMessage,
            timestamp: conv.timestamp,
            unread: conv.unread,
          };
        });

        setConversations(formattedConversations);
      } else {
        setConversations([]);
      }

      setLoading(false);
    };

    fetchConversations();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="space-y-4 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Conversations</h1>
          <div className="flex items-center gap-2">
            <button className="relative p-2">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-2">
        {loading ? (
          <div className="text-center py-10">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No conversations yet.</p>
            <p className="text-sm mt-2">Start chatting with your matches!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors border-none shadow-none"
              onClick={() => navigate(`/chat/${conv.id}`)}
            >
              <div className="flex items-center p-3 gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                  </Avatar>
                  {/* <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-background" /> */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold truncate">{conv.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conv.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="bg-primary h-5 w-5 flex items-center justify-center p-0 rounded-full">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Conversations;
