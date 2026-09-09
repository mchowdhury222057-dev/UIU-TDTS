import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiClientError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { DEMO_ACCOUNTS, SEMESTER } from "../../lib/constants";
import { getInitials } from "../../lib/format";
import { ROLE_COLORS } from "../../lib/roleColors";
import { roleLabel } from "../../lib/roleLabels";
import { PrimaryButton } from "../../components/ui/Form";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string })?.from || "/app/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: demo accounts panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-10 text-white lg:flex">
        {/* Decorative texture: dot grid + soft blurred orbs, purely visual */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-heading text-base font-bold">T</div>
            <span className="font-heading text-lg font-bold">UIU TDTS</span>
          </Link>

          <span className="mt-8 inline-block rounded-full bg-white/15 px-3 py-1 font-mono-data text-xs font-medium tracking-wide">
            {SEMESTER} · University of Innovation and Upliftment
          </span>

          <h2 className="mt-6 font-heading text-3xl font-bold leading-tight">Welcome back to your workspace</h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Pick a color-coded demo account below to jump in instantly, or sign in with your own credentials on the
            right.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-2.5 overflow-y-auto pr-1" style={{ maxHeight: "50vh" }}>
          {DEMO_ACCOUNTS.map((account) => {
            const color = ROLE_COLORS[account.role];
            return (
              <button
                key={account.email}
                onClick={() => quickFill(account.email, account.password)}
                className="group flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2.5 text-left ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/20 hover:ring-white/30"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold text-white shadow-sm ${color.solid}`}
                >
                  {getInitials(account.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{account.name}</span>
                  <span className="block truncate text-xs text-white/70">{account.email}</span>
                </span>
                <span
                  className={`ml-2 shrink-0 rounded-full px-2.5 py-1 font-mono-data text-[10px] font-semibold text-white shadow-sm ${color.solid}`}
                >
                  {roleLabel(account.role)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/60">
          <div className="flex gap-4">
            <span>
              <span className="font-mono-data font-semibold text-white">500+</span> Members
            </span>
            <span>
              <span className="font-mono-data font-semibold text-white">48</span> Projects
            </span>
            <span>
              <span className="font-mono-data font-semibold text-white">4.8★</span> Rating
            </span>
          </div>
          <span>© 2026 UIU TDTS</span>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex flex-col items-center justify-center bg-secondary/40 p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-base font-bold text-white">
                T
              </div>
              <span className="font-heading text-lg font-bold text-foreground">UIU TDTS</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access your workspace.</p>

            {/* Mobile demo accounts */}
            <div className="mt-6 grid grid-cols-2 gap-2 lg:hidden">
              {DEMO_ACCOUNTS.slice(0, 5).map((account) => {
                const color = ROLE_COLORS[account.role];
                return (
                  <button
                    key={account.email}
                    onClick={() => quickFill(account.email, account.password)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:brightness-95 ${color.soft}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${color.solid}`}>
                      {getInitials(account.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{account.name}</span>
                      <span className="block truncate">{roleLabel(account.role)}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@uiu.edu"
                    className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <PrimaryButton type="submit" className="w-full py-2.5" disabled={isSubmitting}>
                <Sparkles size={15} />
                {isSubmitting ? "Signing in..." : "Sign In"}
              </PrimaryButton>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
