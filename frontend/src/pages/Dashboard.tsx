import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Film, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import VideoPlayer from "@/components/VideoPlayer";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [playUrl, setPlayUrl] = useState("");
  const [error, setError] = useState("");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handlePlay() {
    if (!url.trim()) {
      setError("Please enter a video URL");
      return;
    }
    setError("");
    setPlayUrl(url.trim());
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">

      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 shadow-lg shadow-violet-500/30">
              <Film className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">StreamVault</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username ?? ""}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden text-sm font-medium text-white md:block">
                {user?.username}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1.5 w-48 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-2xl">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        {/* User card */}
        <Card className="border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username ?? ""}
                  className="h-14 w-14 rounded-full object-cover ring-4 ring-white/20"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-white">{user?.username}</h1>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                className="ml-auto gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Video player card */}
        <Card className="border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-violet-400 mb-1">
                Universal Video Player
              </p>
              <h2 className="text-xl font-bold text-white">Play Any Video URL</h2>
              <p className="text-sm text-slate-400 mt-1">
                Supports YouTube, Vimeo, MP4, HLS (.m3u8)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=... or MP4/HLS URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handlePlay(); }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-colors"
              />
              <Button
                onClick={handlePlay}
                className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
              >
                Play Video
              </Button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
              {!playUrl ? (
                <div className="aspect-video flex items-center justify-center text-slate-500 text-sm">
                  Paste a URL above and click Play Video
                </div>
              ) : (
                <VideoPlayer url={playUrl} />
              )}
            </div>

          </CardContent>
        </Card>

      </main>
    </div>
  );
}