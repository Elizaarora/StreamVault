import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login?error=google_failed", { replace: true });
      return;
    }

    localStorage.setItem("access_token", token);
    authApi
      .me()
      .then((res) => {
        login(token, res.data);
        // New Google users have no username yet — send them to setup
        const destination = res.data.username ? "/dashboard" : "/setup-username";
        navigate(destination, { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        navigate("/login?error=google_failed", { replace: true });
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
