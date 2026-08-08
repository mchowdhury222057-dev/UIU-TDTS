import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, FolderKanban, ListChecks, Star, Users } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi } from "../../api/misc";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { formatDate } from "../../lib/format";
import { roleLabel } from "../../lib/roleLabels";
import { TASK_STATUS_LABELS } from "../../lib/constants";
import { ErrorState, LoadingState } from "../../components/ui/States";

const STATUS_CHART_COLORS = ["#94a3b8", "#60a5fa", "#818cf8", "#f59e0b", "#a78bfa", "#fb923c", "#34d399", "#f87171"];

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const toneClasses = {
    default: "bg-accent text-primary",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    success: "bg-emerald-50 text-emerald-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 font-mono-data text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniCalendar({ deadlines }: { deadlines: { id: string; title: string; dueDate: string }[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const deadlineDays = useMemo(() => {
    const map = new Map<number, string[]>();
    deadlines.forEach((d) => {
      const date = new Date(d.dueDate);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        map.set(day, [...(map.get(day) ?? []), d.title]);
      }
    });
    return map;
  }, [deadlines, year, month]);

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-heading text-sm font-semibold text-foreground">{monthLabel}</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          const hasDeadline = day !== null && deadlineDays.has(day);
          const isToday = day === now.getDate();
          return (
            <div
              key={idx}
              title={hasDeadline ? deadlineDays.get(day!)?.join(", ") : undefined}
              className={`flex h-7 items-center justify-center rounded-md text-xs ${
                day === null
                  ? ""
                  : isToday
                  ? "bg-primary font-semibold text-white"
                  : hasDeadline
                  ? "bg-accent font-medium text-primary"
                  : "text-foreground"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useFetch(() => dashboardApi.get(), []);

  if (!user) return null;
  if (isLoading) return <LoadingState label="Loading your dashboard..." />;
  if (error || !data) return <ErrorState message={error || "Failed to load dashboard."} onRetry={refetch} />;

  const { stats, upcomingDeadlines, taskCompletionTrend, taskDistribution, weeklyProductivity } = data;
  const firstName =
    user.name
      .split(/\s+/)
      .filter((p) => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(p) && !/^[a-z]\.$/i.test(p))[0] || user.name;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const distributionData = taskDistribution
    .filter((d) => d.count > 0)
    .map((d) => ({ name: TASK_STATUS_LABELS[d.status], value: d.count }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
            Good to see you, {firstName} 👋
          </h2>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <span className="w-fit rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-primary">
          {roleLabel(user.role)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={FolderKanban} label="Projects" value={stats.projects} />
        <StatCard icon={Users} label="Teams" value={stats.teams} />
        <StatCard icon={ListChecks} label="Tasks" value={stats.tasks} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="success" />
        <StatCard icon={Clock3} label="Pending" value={stats.pending} tone="warning" />
        <StatCard icon={AlertTriangle} label="Late" value={stats.late} tone="danger" />
        <StatCard icon={CalendarClock} label="Deadlines" value={stats.deadlines} />
        <StatCard icon={Star} label="Rating" value={stats.rating || "—"} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <p className="font-heading text-sm font-semibold text-foreground">Task Completion Trend</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskCompletionTrend}>
                <defs>
                  <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stroke="#F59E0B" strokeWidth={2} fill="url(#completionFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-sm font-semibold text-foreground">Task Distribution</p>
          <div className="mt-2 h-56">
            {distributionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {distributionData.map((_, i) => (
                      <Cell key={i} fill={STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <p className="font-heading text-sm font-semibold text-foreground">Weekly Productivity</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProductivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <MiniCalendar deadlines={upcomingDeadlines} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="font-heading text-sm font-semibold text-foreground">Upcoming Deadlines</p>
        {upcomingDeadlines.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No upcoming deadlines. You're all clear!</p>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {upcomingDeadlines.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-foreground">{d.title}</span>
                <span className="text-muted-foreground">{formatDate(d.dueDate)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
