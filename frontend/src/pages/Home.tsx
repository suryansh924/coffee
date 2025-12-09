import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button className="p-2">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Home</h1>
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
        </div>
      </header>

      {/* Empty State */}
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center text-muted-foreground px-6">
          <p className="text-lg">Your home feed will appear here</p>
          <p className="text-sm mt-2">Start by chatting with Ella or discovering matches</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
