import { Eye, EyeOff, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiClientError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { DEMO_ACCOUNTS } from "../../lib/constants";
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
      <div className="hidden flex-col justify-between bg-gradient-to-br from-amber-500 to-orange-500 p-10 text-white lg:flex">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-heading text-base font-bold">T</div>
            <span className="font-heading text-lg font-bold">UIU TDTS</span>
          </Link>
          <h2 className="mt-10 font-heading text-3xl font-bold leading-tight">Welcome back to your workspace</h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Jump right in with a demo account below, or sign in with your own credentials on the right.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1" style={{ maxHeight: "56vh" }}>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              onClick={() => quickFill(account.email, account.password)}
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/20"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{account.name}</p>
                <p className="truncate text-xs text-white/70">{account.email}</p>
              </div>
              <span className="ml-3 shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium">
                {roleLabel(account.role)}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-white/60">© 2026 UIU TDTS</p>
      </div>

      {/* Right: login form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-base font-bold text-white">
                T
              </div>
              <span className="font-heading text-lg font-bold text-foreground">UIU TDTS</span>
            </Link>
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access your workspace.</p>

          {/* Mobile demo accounts */}
          <div className="mt-6 grid grid-cols-2 gap-2 lg:hidden">
            {DEMO_ACCOUNTS.slice(0, 5).map((account) => (
              <button
                key={account.email}
                onClick={() => quickFill(account.email, account.password)}
                className="rounded-lg border border-border bg-secondary px-2.5 py-2 text-left text-xs hover:bg-accent"
              >
                <p className="truncate font-semibold text-foreground">{account.name}</p>
                <p className="truncate text-muted-foreground">{roleLabel(account.role)}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@uiu.edu"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
