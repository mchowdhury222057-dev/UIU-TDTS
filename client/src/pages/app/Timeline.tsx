import { useMemo, useState } from "react";
import { tasksApi } from "../../api/tasks";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useFetch } from "../../hooks/useFetch";
import { formatDate } from "../../lib/format";
import { CalendarRange } from "lucide-react";

type ViewMode = "week" | "month" | "semester";

const DAY_MS = 24 * 60 * 60 * 1000;

export function Timeline() {
  const { data, isLoading, error, refetch } = useFetch(() => tasksApi.list(), []);
  const [view, setView] = useState<ViewMode>("month");

  const tasksWithDates = useMemo(() => (data ?? []).filter((t) => t.dueDate).slice(0, 12), [data]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const days = view === "week" ? 7 : view === "month" ? 30 : 120;
    const start = new Date(now.getTime() - days * 0.3 * DAY_MS);
    const end = new Date(now.getTime() + days * DAY_MS);
    return { rangeStart: start, rangeEnd: end };
  }, [view]);

  const totalSpan = rangeEnd.getTime() - rangeStart.getTime();
  const todayOffset = ((Date.now() - rangeStart.getTime()) / totalSpan) * 100;

  if (isLoading) return <LoadingState label="Loading timeline..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Timeline</h2>
        <div className="flex rounded-lg border border-border bg-white p-0.5">
          {(["week", "month", "semester"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
                view === v ? "bg-accent text-primary" : "text-muted-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {tasksWithDates.length === 0 ? (
        <EmptyState icon={<CalendarRange size={28} />} title="No scheduled tasks" description="Tasks with due dates will appear on the timeline." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card p-4">
          <div className="relative min-w-[640px]">
            <div
              className="absolute top-0 z-10 h-full w-px bg-red-400"
              style={{ left: `${Math.min(100, Math.max(0, todayOffset))}%` }}
            >
              <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-red-500">
                Today
              </span>
            </div>

            <div className="space-y-3">
              {tasksWithDates.map((task) => {
                const due = new Date(task.dueDate!);
                const start = new Date(Math.min(due.getTime(), Date.now()) - 6 * DAY_MS);
                const left = Math.max(0, ((start.getTime() - rangeStart.getTime()) / totalSpan) * 100);
                const width = Math.max(3, ((due.getTime() - start.getTime()) / totalSpan) * 100);

                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 truncate text-sm text-foreground" title={task.title}>
                      {task.title}
                    </div>
                    <div className="relative h-7 flex-1 rounded-md bg-muted/60">
                      <div
                        className="absolute top-0 flex h-7 items-center overflow-hidden rounded-md bg-gradient-to-r from-amber-400 to-primary px-2"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded-md bg-white/30"
                          style={{ width: `${task.progress}%` }}
                        />
                        <span className="relative z-10 truncate text-[11px] font-medium text-white">{task.progress}%</span>
                      </div>
                    </div>
                    <div className="hidden w-28 shrink-0 items-center gap-1.5 sm:flex">
                      {task.assignee && <Avatar user={task.assignee} size="sm" />}
                      <span className="truncate text-xs text-muted-foreground">{task.assignee?.name.split(" ")[0]}</span>
                    </div>
                    <div className="w-20 shrink-0 text-right font-mono-data text-xs text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
