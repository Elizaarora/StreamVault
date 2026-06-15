import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, Film, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FieldErrors { username?: string; email?: string; password?: string; confirm?: string; }

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a number",     test: (v: string) => /\d/.test(v) },
  { label: "Contains a letter",     test: (v: string) => /[a-zA-Z]/.test(v) },
];

export default function Signup() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate("/dashboard", { replace: true }); }, [isAuthenticated]);

  function validate() {
    const errs: FieldErrors = {};
    if (!username.trim()) errs.username = "Username is required";
    else if (username.trim().length < 3) errs.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) errs.username = "Letters, numbers, hyphens, underscores only";
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "At least 8 characters required";
    if (!confirm) errs.confirm = "Please confirm your password";
    else if (confirm !== password) errs.confirm = "Passwords do not match";
    setFieldErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await authApi.signup({ username: username.trim(), email, password });
      login(res.data.access_token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const pwStrength = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strengthColor = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"][pwStrength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][pwStrength];

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
            <CardTitle className="text-center text-xl text-white">Create your account</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Start creating videos for free
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-3 border-white/15 bg-white/8 text-white hover:bg-white/15 hover:text-white font-medium backdrop-blur"
              onClick={() => { setIsGoogleLoading(true); authApi.googleLogin("signup"); }}
              disabled={isGoogleLoading || isLoading}
              type="button"
            >
              {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-slate-500">or</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {error}{" "}
                  {error.includes("already") && (
                    <Link to="/login" className="underline text-violet-400 hover:text-violet-300">Sign in instead</Link>
                  )}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username" placeholder="johndoe" autoComplete="username" value={username}
                  onChange={(e) => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: undefined })); }}
                  className={cn("border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30", fieldErrors.username && "border-red-500/50")}
                  disabled={isLoading}
                />
                {fieldErrors.username && <p className="text-xs text-red-400">{fieldErrors.username}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email" type="email" placeholder="you@example.com" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
                  className={cn("border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30", fieldErrors.email && "border-red-500/50")}
                  disabled={isLoading}
                />
                {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    autoComplete="new-password" value={password}
                    onFocus={() => setShowRules(true)}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                    className={cn("border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30", fieldErrors.password && "border-red-500/50")}
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i < pwStrength ? strengthColor : "bg-white/10")} />
                      ))}
                    </div>
                    {strengthLabel && <p className="text-xs text-slate-400">{strengthLabel} password</p>}
                  </div>
                )}

                {showRules && password && (
                  <ul className="space-y-1 pt-0.5">
                    {PASSWORD_RULES.map(rule => {
                      const ok = rule.test(password);
                      return (
                        <li key={rule.label} className={cn("flex items-center gap-1.5 text-xs", ok ? "text-green-400" : "text-slate-500")}>
                          {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password}</p>}
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-slate-300">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                    autoComplete="new-password" value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setFieldErrors(p => ({ ...p, confirm: undefined })); }}
                    className={cn("border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30", fieldErrors.confirm && "border-red-500/50")}
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirm && <p className="text-xs text-red-400">{fieldErrors.confirm}</p>}
                {confirm && confirm === password && !fieldErrors.confirm && (
                  <p className="flex items-center gap-1 text-xs text-green-400">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25" size="lg" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
