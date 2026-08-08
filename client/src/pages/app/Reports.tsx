import { AlertOctagon, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { reportsApi } from "../../api/misc";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { TASK_STATUS_LABELS } from "../../lib/constants";
import { exportCsv, exportExcel, exportPdf } from "../../lib/export";
import { canExportReports } from "../../lib/permissions";
import { AccessDenied } from "./AccessDenied";

const COLORS = ["#94a3b8", "#60a5fa", "#818cf8", "#f59e0b", "#a78bfa", "#fb923c", "#34d399", "#f87171"];

export function Reports() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useFetch(() => reportsApi.get(), []);

  if (!user) return null;
  if (!canExportReports(user)) return <AccessDenied />;
  if (isLoading) return <LoadingState label="Loading reports..." />;
  if (error || !data) return <ErrorState message={error || "Failed to load reports."} onRetry={refetch} />;

  const { teamEfficiency, completionTrend, taskDistribution, lateSubmissions } = data;
  const distributionData = taskDistribution.filter((d) => d.count > 0).map((d) => ({ name: TASK_STATUS_LABELS[d.status], value: d.count }));

  const teamHeaders = ["Team", "Efficiency %", "Completed", "Total Tasks"];
  const teamRows = teamEfficiency.map((t) => [t.team, t.efficiency, t.completed, t.total]);

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (format === "csv") exportCsv("team-efficiency-report", teamHeaders, teamRows);
    if (format === "excel") exportExcel("team-efficiency-report", teamHeaders, teamRows);
    if (format === "pdf") await exportPdf("Team Efficiency Report", teamHeaders, teamRows, "team-efficiency-report");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button onClick={() => handleExport("pdf")} className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => handleExport("excel")} className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => handleExport("csv")} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:brightness-95">
            <Download size={15} /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Teams Tracked</p>
          <p className="mt-1 font-mono-data text-2xl font-semibold text-foreground">{teamEfficiency.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg. Team Efficiency</p>
          <p className="mt-1 font-mono-data text-2xl font-semibold text-foreground">
            {teamEfficiency.length ? Math.round(teamEfficiency.reduce((s, t) => s + t.efficiency, 0) / teamEfficiency.length) : 0}%
          </p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertOctagon size={14} />
            <p className="text-xs">Late Submissions</p>
          </div>
          <p className="mt-1 font-mono-data text-2xl font-semibold text-red-700">{lateSubmissions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
          <p className="font-heading text-sm font-semibold text-foreground">Team Efficiency</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamEfficiency}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="team" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-sm font-semibold text-foreground">Task Distribution</p>
          <div className="mt-2 h-64">
            {distributionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {distributionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="font-heading text-sm font-semibold text-foreground">Completion Trend</p>
        <div className="mt-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 font-heading text-sm font-semibold text-foreground">Team Efficiency Breakdown</p>
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Team</th>
              <th className="pb-2 font-medium">Efficiency</th>
              <th className="pb-2 font-medium">Completed</th>
              <th className="pb-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teamEfficiency.map((t) => (
              <tr key={t.team}>
                <td className="py-2.5 text-foreground">{t.team}</td>
                <td className="py-2.5 font-mono-data text-foreground">{t.efficiency}%</td>
                <td className="py-2.5 text-muted-foreground">{t.completed}</td>
                <td className="py-2.5 text-muted-foreground">{t.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
