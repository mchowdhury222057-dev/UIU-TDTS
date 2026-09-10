import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiClientError } from "../../api/client";
import { DEPARTMENTS } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import type { Department, Role } from "../../types";

const CAMPUS_IMAGE_URL = "/images/uiu-campus.jpg";
const UIU_LOGO_URL = "/images/uiu-logo.png";

const AVATAR_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#EC4899", "#14B8A6", "#6366F1"];

const INPUT_CLASSES =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20";

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

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState<Department>("CS");
  const [role, setRole] = useState<Role>("STUDENT");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!name.trim() || name.trim().length < 2) return "Please enter your full name.";
      if (!email.trim() || !email.includes("@")) return "Please enter a valid university email.";
    }
    if (step === 2) {
      if (password.length < 6) return "Password must be at least 6 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const next = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
        avatarColor,
        department,
        role: role as Extract<Role, "STUDENT" | "LEADER">,
        title: title || undefined,
        bio: bio || undefined,
      });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#111827] via-[#1E293B] to-[#0F172A]">
      {/* Campus photo layer */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${CAMPUS_IMAGE_URL})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/85 via-[#0F172A]/55 to-[#0F172A]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-[#0F172A]/30 lg:hidden" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Left: campus messaging, overlaid on the photo */}
        <div className="flex flex-1 flex-col justify-between gap-8 p-6 sm:p-10 lg:gap-0 lg:p-14">
          <BrandMark />

          <div className="max-w-lg">
            <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
              <span className="text-white">Join Your</span>
              <br />
              <span className="text-[#F97316]">Team.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
              Create your account to start managing academic projects, tasks and deadlines with your team.
            </p>
          </div>

          <div className="hidden lg:block">
            <p className="font-heading text-sm font-semibold text-white/90">UIU</p>
            <p className="text-xs text-white/60">Better Together</p>
          </div>
        </div>

        {/* Right: sign-up card */}
        <div className="flex items-center justify-center p-6 py-10 sm:p-10 lg:w-[560px] lg:shrink-0 lg:p-14">
          <div className="w-full max-w-[500px] rounded-3xl bg-white/95 p-7 shadow-2xl backdrop-blur-sm sm:p-9">
            <BrandMark compact />

            <h2 className="mt-7 font-heading text-2xl font-bold text-[#1E293B] sm:text-[28px]">Create your account</h2>

            <div className="mt-5 flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                      s <= step ? "bg-[#F97316] text-white" : "bg-gray-100 text-[#1E293B]/40"
                    }`}
                  >
                    {s < step ? <CheckCircle2 size={15} /> : s}
                  </div>
                  {s < 3 && <div className={`h-0.5 flex-1 transition ${s < step ? "bg-[#F97316]" : "bg-gray-100"}`} />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              {error && (
                <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Avatar Color</label>
                    <div className="flex gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setAvatarColor(color)}
                          className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${
                            avatarColor === color ? "ring-[#F97316]" : "ring-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Full Name *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">University Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@uiu.edu"
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Confirm Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as Department)}
                      className={INPUT_CLASSES}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={INPUT_CLASSES}>
                      <option value="STUDENT">Member</option>
                      <option value="LEADER">Team Leader</option>
                    </select>
                    <p className="mt-1.5 text-xs text-[#1E293B]/50">
                      Faculty and higher-level roles are assigned by Super Admin.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Backend Developer"
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="A short introduction..."
                      className={`min-h-[80px] ${INPUT_CLASSES}`}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between gap-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#1E293B] transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-1.5 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#EA580C] active:scale-[0.98] active:bg-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                  >
                    Next <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#EA580C] active:scale-[0.98] active:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </button>
                )}
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-[#1E293B]/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="rounded font-semibold text-[#F97316] transition hover:text-[#C2410C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
