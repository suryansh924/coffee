import { ChevronLeft, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();

  // Mock user data
  const user = {
    name: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    bio: "Alex is a curious adventurer and loves everything about Mumbai - from its slums to its beaches. Always game for a long walk around the city.",
    demographics: ["Male", "18-24"],
    traits: ["Creative", "Enthusiastic", "Lifelong Learner", "Community-Focused", "Visionary", "Optimistic", "Collaborative"],
    conversationTopics: ["Technology", "Innovation", "Sustainability", "Mental Wellness", "Future Trends", "Art & Culture", "Science", "Philosophy"],
    coffeePreference: ["Female", "18-24"],
    username: "referodesign",
    openToMeet: true,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Edit Profile</h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => navigate("/profile/edit")}
        >
          Done
        </Button>
      </header>

      <div className="p-6 space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Hello, {user.name}!</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground mt-1">
              Edit Photo
            </Button>
          </div>
        </div>

        {/* Demographics */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Here's what we know about you</h3>
            <button className="p-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-4 text-foreground">
            {user.demographics.map((demo) => (
              <span key={demo}>{demo}</span>
            ))}
          </div>
        </Card>

        {/* About */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">About You</h3>
            <button className="p-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-foreground">{user.bio}</p>
          <button className="text-sm text-primary flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Read More
          </button>
        </Card>

        {/* Traits */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Traits</h3>
            <button className="p-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.traits.map((trait) => (
              <Badge key={trait} className="bg-secondary text-secondary-foreground border-0">
                {trait}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Conversation Topics */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">A perfect conversation is about</h3>
            <button className="p-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.conversationTopics.map((topic) => (
              <Badge key={topic} className="bg-secondary text-secondary-foreground border-0">
                {topic}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Coffee Preference */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">A perfect coffee is with</h3>
            <button className="p-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-4 text-foreground">
            {user.coffeePreference.map((pref) => (
              <span key={pref}>{pref}</span>
            ))}
          </div>
        </Card>

        {/* Username */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Username</h3>
            <button className="p-1">
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-foreground">{user.username}</p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default Profile;
