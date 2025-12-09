import { useEffect, useState, useRef } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  createBaseChatKitUIConfig,
  CHATKIT_SESSION_ENDPOINT,
} from "@/lib/chatkit-ui.config";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MatchesWidget } from "@/components/widgets/MatchesWidget";
import { ProfileOptionsWidget } from "@/components/widgets/ProfileOptionsWidget";

const Ella = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const controlRef = useRef<any>(null);

  // State for React-based widgets
  const [matchesWidget, setMatchesWidget] = useState<any>(null);
  const [profileOptions, setProfileOptions] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const chatKit = useChatKit({
    ...createBaseChatKitUIConfig(),
    api: {
      async getClientSecret(existing) {
        console.log("🔑 getClientSecret called. Existing?", !!existing);
        // Always fetch a new token to ensure we don't use a stale/invalid one
        // especially if the SDK is retrying after a 401.

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          // Should be handled by useEffect, but just in case
          throw new Error("No active session");
        }

        const res = await fetch(CHATKIT_SESSION_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: session.user.id,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create ChatKit session");
        }

        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    onClientTool: async (tool) => {
      console.log("🔧 Client Tool Triggered:", tool.name, tool.params);

      // Get current user for tools that need it
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user.id;

      switch (tool.name) {
        case "open_match_profile": {
          const { match_user_id } = tool.params as { match_user_id: string };
          navigate(`/match/${match_user_id}`);
          return { status: "success" };
        }
        case "open_p2p_chat": {
          const { match_user_id } = tool.params as { match_user_id: string };
          navigate(`/chat/${match_user_id}`);
          return { status: "success" };
        }
        case "show_matches_widget": {
          console.log("Showing matches widget:", tool.params);
          setMatchesWidget(tool.params);
          return { status: "displayed" };
        }
        case "show_profile_builder_options": {
          console.log("Showing profile options:", tool.params);
          setProfileOptions(tool.params);
          return { status: "displayed" };
        }
        case "update_profile_progress": {
          console.log("Updating profile progress:", tool.params);
          return { status: "success", updated: true };
        }
        // Backend Tools Proxy
        case "save_profile_section": {
          console.log("💾 Saving profile section...", tool.params);
          // FORCE use of authenticated user_id to prevent agent hallucinations creating duplicate profiles
          const user_id = currentUserId;
          const { attributes } = tool.params as any;

          if (!user_id)
            return { status: "error", message: "No user_id available" };

          try {
            const res = await fetch("/api/tools/save_profile_section", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id, attributes }),
            });
            const data = await res.json();
            console.log("✅ Save result:", data);
            return data;
          } catch (err) {
            console.error("❌ Save failed:", err);
            return { status: "error", message: String(err) };
          }
        }
        case "get_user_profile": {
          // FORCE use of authenticated user_id
          const user_id = currentUserId;

          if (!user_id)
            return { status: "error", message: "No user_id available" };

          const res = await fetch(`/api/tools/get_user_profile/${user_id}`);
          return await res.json();
        }
        case "trigger_matching": {
          // FORCE use of authenticated user_id
          const user_id = currentUserId;

          if (!user_id)
            return { status: "error", message: "No user_id available" };

          const res = await fetch(`/api/tools/trigger_matching/${user_id}`, {
            method: "POST",
          });
          return await res.json();
        }
        case "get_matches": {
          // FORCE use of authenticated user_id
          const user_id = currentUserId;
          const { limit } = tool.params as any;

          if (!user_id)
            return { status: "error", message: "No user_id available" };

          const res = await fetch(
            `/api/tools/get_matches/${user_id}?limit=${limit || 10}`
          );
          return await res.json();
        }
        default:
          console.warn("Unknown client tool:", tool.name);
          return { status: "error", message: "Unknown tool" };
      }
    },
  });

  const { control, ref, sendUserMessage } = chatKit;

  useEffect(() => {
    controlRef.current = chatKit;

    // Listen for thread changes to persist them
    const handleThreadChange = async (event: any) => {
      const threadId = event.detail.threadId;
      if (threadId) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user.id) {
          console.log("🧵 Saving thread:", threadId);
          fetch("/api/threads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: session.user.id,
              thread_id: threadId,
            }),
          }).catch(console.error);
        }
      }
    };

    // Add event listener
    // Note: ChatKit types might not expose addEventListener directly on control,
    // but the underlying element or the library usually emits events.
    // However, looking at the docs, we might need to attach to the DOM element or use a callback if available.
    // The ChatKit component renders a custom element `openai-chatkit`.

    const chatkitElement = document.querySelector("openai-chatkit");
    if (chatkitElement) {
      chatkitElement.addEventListener(
        "chatkit.thread.change",
        handleThreadChange
      );
      chatkitElement.addEventListener(
        "chatkit.thread.load.end",
        handleThreadChange
      );
    }

    return () => {
      if (chatkitElement) {
        chatkitElement.removeEventListener(
          "chatkit.thread.change",
          handleThreadChange
        );
        chatkitElement.removeEventListener(
          "chatkit.thread.load.end",
          handleThreadChange
        );
      }
    };
  }, [control, ref]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background pb-16 relative">
      <div className="flex-1 relative overflow-hidden">
        <ChatKit ref={ref} control={control} className="h-full w-full" />
      </div>

      {/* Render React Widgets Overlay */}
      {matchesWidget && (
        <MatchesWidget
          matches={matchesWidget.matches}
          headline={matchesWidget.headline}
          onClose={() => setMatchesWidget(null)}
          onOpenProfile={(id) => navigate(`/match/${id}`)}
          onOpenChat={(id) => navigate(`/chat/${id}`)}
        />
      )}

      {profileOptions && (
        <ProfileOptionsWidget
          question_id={profileOptions.question_id}
          prompt={profileOptions.prompt}
          options={profileOptions.options}
          allow_multiple={profileOptions.allow_multiple}
          onClose={() => setProfileOptions(null)}
          onSelect={(label, value) => {
            controlRef.current?.sendUserMessage({ text: label });
            setProfileOptions(null);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Ella;
