import { useEffect, useState } from "react";
import { Sparkles, MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("users")
          .select("name, user_id")
          .eq("user_id", session.user.id)
          .single();
        setUser(data);
      }
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold">Good Morning,</h1>
          <h2 className="text-2xl font-bold text-primary">
            {user?.name || "Friend"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Avatar
            className="h-10 w-10 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_id}`}
            />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Main Action: Chat with Ella */}
        <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-none overflow-hidden relative">
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Find your match</h3>
                <p className="text-violet-100 mb-4 max-w-[200px]">
                  Chat with Ella to find people who truly get you.
                </p>
                <Button
                  variant="secondary"
                  className="bg-white text-violet-600 hover:bg-violet-50"
                  onClick={() => navigate("/ella")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Talk to Ella
                </Button>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                <Sparkles className="w-32 h-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate("/discover")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <Search className="w-6 h-6" />
              </div>
              <span className="font-medium">Discover</span>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate("/conversations")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="font-medium">Chats</span>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Tip */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Daily Tip</h4>
          <p className="text-sm text-muted-foreground">
            "Be yourself! Authenticity is the most attractive quality you can
            have."
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
