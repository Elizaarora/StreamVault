import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, Film, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, { text: string; action?: { label: string; href: string } }> = {
  google_denied:    { text: "Google sign-in was cancelled." },
  google_failed:    { text: "Google sign-in failed. Please try again." },
  already_registered: {
    text: "You already have an account. Sign in below or use Google.",
  },
};

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password modal state
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]   = useState("");
  const [forgotSuccess, setForgotSuccess] = useState<{ message: string } | null>(null);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  useEffect(() => {
    const key = searchParams.get("error");
    if (key && ERROR_MESSAGES[key]) setError(ERROR_MESSAGES[key].text);
  }, [searchParams]);

  function validate() {
    const errs: typeof fieldErrors = {};
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail) { setForgotError("Please enter your email."); return; }
    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setForgotSuccess(res.data);
    } catch (err: any) {
      setForgotError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgot() {
    setShowForgot(false);
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(res.data.access_token, res.data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4">
      {showForgot && (
        <ForgotPasswordModal
          forgotEmail={forgotEmail} setForgotEmail={setForgotEmail}
          forgotLoading={forgotLoading} forgotError={forgotError}
          forgotSuccess={forgotSuccess} onSubmit={handleForgotSubmit} onClose={closeForgot}
        />
      )}
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
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
            <CardTitle className="text-center text-xl text-white">Welcome back</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Sign in to continue creating
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-3 border-white/15 bg-white/8 text-white hover:bg-white/15 hover:text-white font-medium backdrop-blur"
              onClick={() => { setIsGoogleLoading(true); authApi.googleLogin("signin"); }}
              disabled={isGoogleLoading || isLoading}
              type="button"
            >
              {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
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
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email" type="email" placeholder="you@example.com" autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
                  className={cn(
                    "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30",
                    fieldErrors.email && "border-red-500/50"
                  )}
                  disabled={isLoading}
                />
                {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors" tabIndex={-1}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    autoComplete="current-password" value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                    className={cn(
                      "border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30",
                      fieldErrors.password && "border-red-500/50"
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password}</p>}
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25" size="lg" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
                Sign up free
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function ForgotPasswordModal({ forgotEmail, setForgotEmail, forgotLoading, forgotError, forgotSuccess, onSubmit, onClose }: {
  forgotEmail: string; setForgotEmail: (v: string) => void;
  forgotLoading: boolean; forgotError: string;
  forgotSuccess: { message: string; dev_reset_url?: string } | null;
  onSubmit: (e: React.FormEvent) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-white mb-1">Reset password</h2>
        <p className="text-sm text-slate-400 mb-5">
          Enter your email and we'll send you a reset link.
        </p>

        {!forgotSuccess ? (
          <form onSubmit={onSubmit} className="space-y-4">
            {forgotError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" /> {forgotError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-slate-300">Email address</Label>
              <Input
                id="forgot-email" type="email" placeholder="you@example.com" autoFocus
                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30"
                disabled={forgotLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25" disabled={forgotLoading}>
              {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-3 text-sm text-green-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{forgotSuccess.message}</span>
            </div>


            <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" onClick={onClose}>
              Back to sign in
            </Button>
          </div>
        )}
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
