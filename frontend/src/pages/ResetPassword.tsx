import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, Film, CheckCircle2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a number",     test: (v: string) => /\d/.test(v) },
  { label: "Contains a letter",     test: (v: string) => /[a-zA-Z]/.test(v) },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  const allRulesPassed = PASSWORD_RULES.every(r => r.test(password));
  const passwordsMatch = password === confirm && confirm.length > 0;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4">
        <div className="text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-white font-medium">Invalid reset link</p>
          <p className="text-slate-400 text-sm">This link is missing the reset token.</p>
          <Link to="/login" className="text-violet-400 hover:text-violet-300 text-sm underline">Back to sign in</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!allRulesPassed) { setError("Password doesn't meet requirements."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Reset failed. The link may have expired.");
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
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl text-white">
              {success ? "Password updated" : "Set new password"}
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              {success ? "You can now sign in with your new password." : "Choose a strong password for your account."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  size="lg"
                  onClick={() => navigate("/login", { replace: true })}
                >
                  Go to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-300">New password</Label>
                  <div className="relative">
                    <Input
                      id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      autoFocus autoComplete="new-password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30"
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <ul className="space-y-1 pt-1">
                      {PASSWORD_RULES.map(rule => {
                        const ok = rule.test(password);
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-slate-300">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                      autoComplete="new-password" value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={cn(
                        "border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30",
                        confirm.length > 0 && !passwordsMatch && "border-red-500/50"
                      )}
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && (
                    <p className={cn("flex items-center gap-1 text-xs", passwordsMatch ? "text-green-400" : "text-red-400")}>
                      {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  size="lg"
                  disabled={isLoading || !allRulesPassed || !passwordsMatch}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
                </Button>

                <p className="text-center text-sm text-slate-500">
                  Remember it?{" "}
                  <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
