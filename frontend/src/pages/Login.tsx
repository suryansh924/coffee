import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "otp">("input");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem("coffee_user_id", session.user.id);
        // Sync user to backend
        fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
          }),
        }).catch(console.error);
        navigate("/ella");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem("coffee_user_id", session.user.id);
        // Sync user to backend
        fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
          }),
        }).catch(console.error);
        navigate("/ella");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      if (authMethod === "email") {
        const res = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        error = res.error;
      } else {
        const res = await supabase.auth.signInWithOtp({
          phone,
          options: { shouldCreateUser: true },
        });
        error = res.error;
      }

      if (error) throw error;

      toast.success(`Code sent to your ${authMethod}!`);
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data, error;
      if (authMethod === "email") {
        const res = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });
        data = res.data;
        error = res.error;
      } else {
        const res = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: "sms",
        });
        data = res.data;
        error = res.error;
      }

      if (error) throw error;

      if (data.session) {
        toast.success("Logged in successfully!");
        localStorage.setItem("coffee_user_id", data.user?.id || "");
        navigate("/ella");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Coffee</CardTitle>
          <CardDescription>
            {step === "input"
              ? "Sign in or create an account"
              : `Enter the code sent to your ${authMethod}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "input" ? (
            <Tabs
              defaultValue="email"
              onValueChange={(v) => setAuthMethod(v as "email" | "phone")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Code"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="phone">
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g. +1)
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Code"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("input")}
                disabled={loading}
              >
                Back to {authMethod === "email" ? "Email" : "Phone"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
