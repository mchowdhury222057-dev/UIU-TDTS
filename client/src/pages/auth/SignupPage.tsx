import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiClientError } from "../../api/client";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Form";
import { useAuth } from "../../context/AuthContext";
import { DEPARTMENTS } from "../../lib/constants";
import type { Department, Role } from "../../types";

const AVATAR_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#EC4899", "#14B8A6", "#6366F1"];

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
    <div className="flex min-h-screen items-center justify-center bg-secondary p-6">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-base font-bold text-white">
            T
          </div>
          <span className="font-heading text-lg font-bold text-foreground">UIU TDTS</span>
        </Link>

        <h1 className="mt-6 font-heading text-2xl font-bold text-foreground">Create your account</h1>

        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  s <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 size={15} /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 flex-1 ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Avatar Color</label>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${
                        avatarColor === color ? "ring-primary" : "ring-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">University Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@uiu.edu"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="STUDENT">Member</option>
                  <option value="LEADER">Team Leader</option>
                </select>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Faculty and higher-level roles are assigned by Super Admin.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short introduction..."
                  className="min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-2">
            {step > 1 ? (
              <SecondaryButton type="button" onClick={back}>
                <ArrowLeft size={15} /> Back
              </SecondaryButton>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <PrimaryButton type="button" onClick={next}>
                Next <ArrowRight size={15} />
              </PrimaryButton>
            ) : (
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </PrimaryButton>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
