import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import { Loader } from "@/components/Loader";

const Discover = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch matches and join with user details
      // Note: We use the foreign key relationship to get the match user's details
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          match_details:users!match_user_id(*)
        `
        )
        .eq("user_id", session.user.id)
        .order("score", { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setMatches(data || []);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Discover</h1>
        <div className="flex items-center gap-2">
          <button className="relative p-2">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="py-10">
            <Loader text="Loading matches..." />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No matches yet.</p>
            <p className="text-sm mt-2">Chat with Ella to find people!</p>
            <Button className="mt-4" onClick={() => navigate("/ella")}>
              Chat with Ella
            </Button>
          </div>
        ) : (
          matches.map((match) => {
            const profile = match.match_details;
            if (!profile) return null;

            return (
              <Card key={match.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_id}`}
                          />
                          <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">
                            {profile.name}, {profile.age}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {profile.city}
                          </p>
                        </div>
                      </div>
                      {match.score && (
                        <Badge
                          variant="secondary"
                          className="bg-violet-100 text-violet-700"
                        >
                          {Math.round(match.score * 100)}% Match
                        </Badge>
                      )}
                    </div>

                    {profile.tagline && (
                      <p className="text-sm text-muted-foreground mb-3 italic">
                        "{profile.tagline}"
                      </p>
                    )}

                    {match.overlap_interests &&
                      match.overlap_interests.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {match.overlap_interests
                            .slice(0, 3)
                            .map((interest: string) => (
                              <span
                                key={interest}
                                className="text-xs px-2 py-1 bg-secondary rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                          {match.overlap_interests.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                              +{match.overlap_interests.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/match/${profile.user_id}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => navigate(`/chat/${profile.user_id}`)}
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Discover;
