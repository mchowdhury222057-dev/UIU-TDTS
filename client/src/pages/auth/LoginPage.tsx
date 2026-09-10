import {
  ArrowRight,
  CalendarCheck,
  Eye,
  EyeOff,
  FolderKanban,
  ListChecks,
  Lock,
  Mail,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiClientError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const CAMPUS_IMAGE_URL = "/images/uiu-campus.jpg";
const UIU_LOGO_URL = "/images/uiu-logo.png";

const FEATURES = [
  { icon: FolderKanban, label: "Manage Projects" },
  { icon: ListChecks, label: "Track Tasks" },
  { icon: Users, label: "Build Teams" },
  { icon: CalendarCheck, label: "Meet Deadlines" },
];

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ${
          compact ? "h-10 w-10" : "h-12 w-12"
        }`}
      >
        <img src={UIU_LOGO_URL} alt="UIU logo" className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className={`font-heading font-bold ${compact ? "text-sm text-[#1E293B]" : "text-base text-white"}`}>UIU</p>
        <p className={`truncate font-medium ${compact ? "text-[11px] text-[#1E293B]/60" : "text-xs text-white/80"}`}>
          Task Delegation &amp; Tracking System
        </p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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

  const handleForgotPassword = () => {
    showToast("Password resets aren't self-service yet — please contact your Super Admin.");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#111827] via-[#1E293B] to-[#0F172A]">
      {/* Campus photo layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${CAMPUS_IMAGE_URL})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/85 via-[#0F172A]/55 to-[#0F172A]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-[#0F172A]/30 lg:hidden" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Left: campus messaging, overlaid on the photo */}
        <div className="flex flex-1 flex-col justify-between gap-8 p-6 sm:p-10 lg:gap-0 lg:p-14">
          <BrandMark />

          <div className="max-w-lg">
            <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
              <span className="text-white">Plan. Collaborate.</span>
              <br />
              <span className="text-[#F97316]">Complete.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
              Manage academic projects, tasks, teams and deadlines in one place.
            </p>

            <div className="mt-8 hidden grid-cols-2 gap-4 lg:grid">
              {FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="group flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-3 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/15"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F97316]/50 text-[#F97316] transition group-hover:scale-105 group-hover:bg-[#F97316]/10">
                    <feature.icon size={17} />
                  </div>
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="font-heading text-sm font-semibold text-white/90">UIU</p>
            <p className="text-xs text-white/60">Better Together</p>
          </div>
        </div>

        {/* Right: sign-in card */}
        <div className="flex items-center justify-center p-6 pt-2 sm:p-10 lg:w-[560px] lg:shrink-0 lg:p-14">
          <div
            className={`w-full max-w-[500px] rounded-3xl bg-white/95 p-7 shadow-2xl backdrop-blur-sm transition-all duration-500 ease-out sm:p-9 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <BrandMark compact />

            <h2 className="mt-7 font-heading text-2xl font-bold text-[#1E293B] sm:text-[28px]">Welcome Back</h2>
            <p className="mt-1.5 text-sm text-[#1E293B]/60">Sign in to continue managing your academic projects.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-[#1E293B]">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E293B]/40" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-[#1E293B]">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E293B]/40" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-[#1E293B] outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded text-[#1E293B]/40 transition hover:text-[#1E293B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="rounded text-xs font-semibold text-[#F97316] transition hover:text-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#EA580C] active:scale-[0.98] active:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                {isSubmitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#1E293B]/60">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="rounded font-semibold text-[#F97316] transition hover:text-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
