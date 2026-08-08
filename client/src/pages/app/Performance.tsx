import { Award, Gauge, Rocket, Trophy } from "lucide-react";
import { useMemo } from "react";
import { performanceApi } from "../../api/misc";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";

function Highlight({ icon: Icon, label, name, sub }: { icon: typeof Trophy; label: string; name: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-base font-semibold text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function Performance() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useFetch(() => performanceApi.list(), []);

  const highlights = useMemo(() => {
    if (!data || data.length === 0) return null;
    const topPerformer = [...data].sort((a, b) => b.score - a.score)[0];
    const fastestFinisher = [...data].sort((a, b) => b.completed - a.completed)[0];
    const bestAttendance = [...data].sort((a, b) => b.attendance - a.attendance)[0];
    const topRated = [...data].sort((a, b) => b.rating - a.rating)[0];
    return { topPerformer, fastestFinisher, bestAttendance, topRated };
  }, [data]);

  if (!user) return null;
  if (isLoading) return <LoadingState label="Loading performance data..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-bold text-foreground">Performance & Ratings</h2>

      {!data || data.length === 0 ? (
        <EmptyState icon={<Gauge size={28} />} title="No performance data yet" description="Performance records appear once tasks are completed and reviewed." />
      ) : (
        <>
          {highlights && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Highlight icon={Trophy} label="Top Performer" name={highlights.topPerformer.user.name} sub={`Score ${highlights.topPerformer.score}`} />
              <Highlight icon={Rocket} label="Fastest Finisher" name={highlights.fastestFinisher.user.name} sub={`${highlights.fastestFinisher.completed} completed`} />
              <Highlight icon={Award} label="Best Attendance" name={highlights.bestAttendance.user.name} sub={`${highlights.bestAttendance.attendance}% attendance`} />
              <Highlight icon={Gauge} label="Top Rated" name={highlights.topRated.user.name} sub={`${highlights.topRated.rating.toFixed(1)}★ rating`} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Avatar user={p.user} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{p.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.user.title || p.user.roleLabel}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-mono-data text-sm font-semibold text-primary">{p.rating.toFixed(1)}★</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Project: {p.project.name}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <p className="font-mono-data text-sm font-semibold text-foreground">{p.completed}</p>
                    <p className="text-[10px] text-muted-foreground">Done</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <p className="font-mono-data text-sm font-semibold text-foreground">{p.late}</p>
                    <p className="text-[10px] text-muted-foreground">Late</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <p className="font-mono-data text-sm font-semibold text-foreground">{p.pending}</p>
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Points: <span className="font-mono-data text-foreground">{p.points}</span></span>
                  <span>Attendance: <span className="font-mono-data text-foreground">{p.attendance}%</span></span>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Score</span>
                    <span className="font-mono-data">{p.score}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
