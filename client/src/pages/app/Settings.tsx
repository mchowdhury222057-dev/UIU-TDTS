import { FormEvent, useState } from "react";
import { ApiClientError } from "../../api/client";
import { usersApi } from "../../api/users";
import { PrimaryButton, Select } from "../../components/ui/Form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { roleLabel } from "../../lib/roleLabels";

interface LocalPrefs {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}

const PREFS_KEY = "uiu_tdts_settings";

function loadPrefs(): LocalPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed local state
  }
  return {
    language: "English",
    timezone: "Asia/Dhaka (GMT+6)",
    emailNotifications: true,
    pushNotifications: true,
    twoFactorEnabled: false,
  };
}

function savePrefs(prefs: LocalPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<LocalPrefs>(loadPrefs);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const updatePrefs = (patch: Partial<LocalPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await usersApi.updatePassword(user.id, currentPassword, newPassword);
      showToast("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiClientError ? err.message : "Failed to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="font-heading text-xl font-bold text-foreground">Settings</h2>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Preferences</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Language</label>
            <Select value={prefs.language} onChange={(e) => updatePrefs({ language: e.target.value })}>
              <option>English</option>
              <option>Bengali</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Timezone</label>
            <Select value={prefs.timezone} onChange={(e) => updatePrefs({ timezone: e.target.value })}>
              <option>Asia/Dhaka (GMT+6)</option>
              <option>UTC</option>
              <option>America/New_York (GMT-4)</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Notifications</h3>
        <div className="divide-y divide-border">
          <ToggleRow
            label="Email notifications"
            description="Receive updates about tasks and reviews via email."
            checked={prefs.emailNotifications}
            onChange={(v) => updatePrefs({ emailNotifications: v })}
          />
          <ToggleRow
            label="Push notifications"
            description="Get real-time alerts in your browser."
            checked={prefs.pushNotifications}
            onChange={(v) => updatePrefs({ pushNotifications: v })}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Security</h3>
        <ToggleRow
          label="Two-factor authentication"
          description="Add an extra layer of security to your account."
          checked={prefs.twoFactorEnabled}
          onChange={(v) => updatePrefs({ twoFactorEnabled: v })}
        />
        <form onSubmit={handlePasswordUpdate} className="mt-3 space-y-3 border-t border-border pt-4">
          {passwordError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{passwordError}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <PrimaryButton type="submit" disabled={isSaving || !currentPassword || !newPassword}>
            {isSaving ? "Updating..." : "Update Password"}
          </PrimaryButton>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading text-sm font-semibold text-foreground">Account</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-foreground">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="text-foreground">{roleLabel(user.role)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-foreground">{user.department || "—"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
