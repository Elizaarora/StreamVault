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

interface FieldErrors { first_name?: string; last_name?: string; email?: string; password?: string; confirm?: string; }

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a number",     test: (v: string) => /\d/.test(v) },
  { label: "Contains a letter",     test: (v: string) => /[a-zA-Z]/.test(v) },
];

export default function Signup() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  
  const [email, setEmail]         = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { if (isAuthenticated) navigate("/dashboard", { replace: true }); }, [isAuthenticated]);

  function validate() {
    const errs: FieldErrors = {};
    if (!firstName.trim()) errs.first_name = "First name is required";
    if (!lastName.trim()) errs.last_name = "Last name is required";
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
      const res = await authApi.signup({ first_name: firstName.trim(), last_name: lastName.trim(), email, password });
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
            {/* Email/password signup */}

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

              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name" className="text-slate-300">First name</Label>
                  <Input
                    id="first-name" placeholder="John" autoComplete="given-name" value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setFieldErrors(p => ({ ...p, first_name: undefined })); }}
                    className={cn("border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30", fieldErrors.first_name && "border-red-500/50")}
                    disabled={isLoading}
                  />
                  {fieldErrors.first_name && <p className="text-xs text-red-400">{fieldErrors.first_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name" className="text-slate-300">Last name</Label>
                  <Input
                    id="last-name" placeholder="Doe" autoComplete="family-name" value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setFieldErrors(p => ({ ...p, last_name: undefined })); }}
                    className={cn("border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30", fieldErrors.last_name && "border-red-500/50")}
                    disabled={isLoading}
                  />
                  {fieldErrors.last_name && <p className="text-xs text-red-400">{fieldErrors.last_name}</p>}
                </div>
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

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25" size="lg" disabled={isLoading}>
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

