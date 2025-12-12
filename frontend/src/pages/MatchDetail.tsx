import { useEffect, useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const MatchDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      if (!id) return;

      // Fetch user profile of the match
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", id)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
      } else {
        setProfile(userProfile);
      }

      // Fetch match data (score, reasons)
      const { data: matchInfo, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("match_user_id", id)
        .maybeSingle();

      if (matchError) {
        console.error("Error fetching match:", matchError);
      } else {
        setMatchData(matchInfo);
      }

      setLoading(false);
    };

    fetchMatchDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        User not found
      </div>
    );
  }

  const score = matchData?.score ? Math.round(matchData.score * 100) : 0;
  const reasons = matchData?.match_reason
    ? [matchData.match_reason]
    : ["You have compatible interests and personalities."];

  // Combine interests and traits for topics
  const topics = [
    ...(profile.interests || []),
    ...(profile.personality_traits || []),
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Coffee with {profile.name}?</h1>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_id}`}
            />
            <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Conversation Quality */}
        {matchData && (
          <Card className="p-6 bg-violet-100 border-violet-200 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-600" />
              <span className="text-4xl font-bold text-violet-600">
                {score}%
              </span>
            </div>
            <h2 className="text-xl font-semibold text-center text-violet-900">
              Chance you'll have a<br />
              Good Conversation
            </h2>
          </Card>
        )}

        {/* Contexts / Match Reason */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Why you matched</h3>
          {reasons.map((reason, idx) => (
            <p key={idx} className="text-foreground leading-relaxed">
              {reason}
            </p>
          ))}
        </div>

        {/* About / Tagline (Replacing Recent Activity) */}
        {profile.tagline && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About {profile.name}</h3>
            <Card className="p-4 space-y-2">
              <p className="text-sm text-foreground italic">
                "{profile.tagline}"
              </p>
            </Card>
          </div>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Feel Free to Bring Up</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="py-2 px-3 text-sm"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

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
