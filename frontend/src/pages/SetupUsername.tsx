import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Film, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const RULES = [
  { label: "At least 3 characters",                  test: (v: string) => v.length >= 3 },
  { label: "Max 30 characters",                       test: (v: string) => v.length <= 30 },
  { label: "Letters, numbers, hyphens, underscores",  test: (v: string) => /^[a-zA-Z0-9_-]+$/.test(v) },
];

export default function SetupUsername() {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const allRulesPassed = username.length > 0 && RULES.every(r => r.test(username));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTouched(true);
    if (!allRulesPassed) return;
    setIsLoading(true);
    try {
      const res = await authApi.setUsername(username.trim());
      if (token && user) login(token, { ...user, username: res.data.username! });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to set username. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500 shadow-2xl shadow-violet-500/40 ring-1 ring-violet-400/30">
            <Film className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">StreamVault</h1>
            <p className="text-sm text-slate-400">Stream & create, effortlessly</p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            {user?.avatar && (
              <img src={user.avatar} alt="avatar"
                className="mx-auto mb-2 h-14 w-14 rounded-full object-cover ring-2 ring-violet-500/40" />
            )}
            <CardTitle className="text-xl text-white">One last step</CardTitle>
            <CardDescription className="text-slate-400">
              Choose a username for your account.<br />
              <span className="text-xs text-slate-500">Signed in as {user?.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username" placeholder="e.g. johndoe" autoFocus autoComplete="username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  onBlur={() => setTouched(true)}
                  className={cn(
                    "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30",
                    touched && !allRulesPassed && username.length > 0 && "border-red-500/50"
                  )}
                  disabled={isLoading}
                />

                {username.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {RULES.map(rule => {
                      const ok = rule.test(username);
                      return (
                        <li key={rule.label} className={cn("flex items-center gap-1.5 text-xs transition-colors", ok ? "text-green-400" : "text-slate-500")}>
                          {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25" size="lg" disabled={isLoading || !allRulesPassed}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
