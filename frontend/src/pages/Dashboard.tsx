import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Film, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
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
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden text-sm font-medium text-white md:block">{user?.username}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1.5 w-48 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-2xl animate-fade-in">
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
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {initials}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                <p className="text-slate-400">{user?.email}</p>
              </div>

              <div className="w-full max-w-xs space-y-2 pt-2">
                {[
                  { label: "Account ID", value: user?.id },
                  {
                    label: "Member since",
                    value: user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-400">{label}</span>
                    <span className="font-medium text-white truncate ml-4 max-w-[55%] text-right">{value}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-2 gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
