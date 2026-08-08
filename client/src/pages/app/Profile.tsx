import { LogOut, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { performanceApi } from "../../api/misc";
import { notificationsApi } from "../../api/notifications";
import { teamsApi } from "../../api/teams";
import { EditProfileModal } from "../../components/modals/EditProfileModal";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { timeAgo } from "../../lib/format";
import { roleLabel } from "../../lib/roleLabels";

export function Profile() {
  const { user, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const { data: performance } = useFetch(() => performanceApi.list(), []);
  const { data: teams } = useFetch(() => teamsApi.list(), []);
  const { data: notifications } = useFetch(() => notificationsApi.list(), []);

  const myPerformance = useMemo(() => performance?.filter((p) => p.userId === user?.id) ?? [], [performance, user]);
  const myTeams = useMemo(() => teams?.filter((t) => t.leaderId === user?.id || t.members.some((m) => m.userId === user?.id)) ?? [], [teams, user]);

  const totals = useMemo(() => {
    if (myPerformance.length === 0) return { score: 0, completed: 0, points: 0, rating: 0 };
    const score = Math.round(myPerformance.reduce((s, p) => s + p.score, 0) / myPerformance.length);
    const completed = myPerformance.reduce((s, p) => s + p.completed, 0);
    const points = myPerformance.reduce((s, p) => s + p.points, 0);
    const rating = myPerformance.reduce((s, p) => s + p.rating, 0) / myPerformance.length;
    return { score, completed, points, rating };
  }, [myPerformance]);

  if (!user) return null;

  const primaryTeam = myTeams[0];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-1">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="mx-auto w-fit">
            <Avatar user={user} size="lg" />
          </div>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.title || "—"}</p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge className="border-accent bg-accent text-primary">{roleLabel(user.role)}</Badge>
            {user.department && <Badge>{user.department}</Badge>}
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 border-t border-border pt-4 text-center">
            <div>
              <p className="font-mono-data text-base font-semibold text-foreground">{totals.score}</p>
              <p className="text-[10px] text-muted-foreground">Score</p>
            </div>
            <div>
              <p className="font-mono-data text-base font-semibold text-foreground">{totals.completed}</p>
              <p className="text-[10px] text-muted-foreground">Done</p>
            </div>
            <div>
              <p className="font-mono-data text-base font-semibold text-foreground">{totals.points}</p>
              <p className="text-[10px] text-muted-foreground">Points</p>
            </div>
            <div>
              <p className="font-mono-data text-base font-semibold text-foreground">{totals.rating ? totals.rating.toFixed(1) : "—"}</p>
              <p className="text-[10px] text-muted-foreground">Rating</p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              <Pencil size={14} /> Edit Profile
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">About</h3>
          <p className="mt-2 text-sm text-muted-foreground">{user.bio || "No bio added yet."}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              user.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">Account Info</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="text-foreground">{user.department || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-foreground">{roleLabel(user.role)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Semester</p>
              <p className="text-foreground">{user.semester || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Project</p>
              <p className="text-foreground">{primaryTeam?.project?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Team</p>
              <p className="text-foreground">{primaryTeam?.name || "—"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">Recent Activity</h3>
          <div className="mt-2 divide-y divide-border">
            {(notifications ?? []).slice(0, 4).map((n) => (
              <div key={n.id} className="py-2.5 text-sm">
                <p className="text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
            {(!notifications || notifications.length === 0) && <p className="py-2 text-sm text-muted-foreground">No recent activity.</p>}
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
