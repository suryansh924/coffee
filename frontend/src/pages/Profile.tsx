import { useEffect, useState } from "react";
import { ChevronLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setUser(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">My Profile</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <div className="p-6 space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`}
            />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {user.name}, {user.age}
            </h2>
            <p className="text-muted-foreground">{user.city}</p>
          </div>
        </div>

        {/* Stats/Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">{user.occupation || "Not specified"}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium capitalize">
              {user.gender || "Not specified"}
            </p>
          </div>
        </div>

        {/* Bio/Tagline */}
        {user.tagline && (
          <div className="space-y-2">
            <h3 className="font-semibold">About Me</h3>
            <p className="text-muted-foreground leading-relaxed">
              {user.tagline}
            </p>
          </div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personality */}
        {user.personality_traits && user.personality_traits.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Personality</h3>
            <div className="flex flex-wrap gap-2">
              {user.personality_traits.map((trait: string) => (
                <span
                  key={trait}
                  className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
