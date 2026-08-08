import { TaskStatus, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { projectVisibilityWhere } from "./project.service";
import { taskVisibilityWhere } from "./task.service";
import { teamVisibilityWhere } from "./team.service";
import { performanceVisibilityWhere } from "./performance.service";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getDashboardStats(user: User) {
  const [projects, teams, tasks, performanceRecords] = await Promise.all([
    prisma.project.findMany({ where: projectVisibilityWhere(user) }),
    prisma.team.findMany({ where: teamVisibilityWhere(user) }),
    prisma.task.findMany({ where: taskVisibilityWhere(user) }),
    prisma.performance.findMany({ where: performanceVisibilityWhere(user) }),
  ]);

  const now = Date.now();
  const completed = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
  const cancelled = tasks.filter((t) => t.status === TaskStatus.CANCELLED);
  const pending = tasks.filter(
    (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED
  );
  const late = pending.filter((t) => t.dueDate && t.dueDate.getTime() < now);

  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate && t.dueDate.getTime() >= now)
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))
    .slice(0, 6)
    .map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate }));

  const avgRating = performanceRecords.length
    ? performanceRecords.reduce((sum, p) => sum + p.rating, 0) / performanceRecords.length
    : 0;

  // Task completion trend: last 6 weeks, count of tasks completed within each week window.
  const taskCompletionTrend = Array.from({ length: 6 }).map((_, idx) => {
    const weeksAgo = 5 - idx;
    const start = now - (weeksAgo + 1) * 7 * DAY_MS;
    const end = now - weeksAgo * 7 * DAY_MS;
    const count = completed.filter((t) => t.updatedAt.getTime() >= start && t.updatedAt.getTime() < end).length;
    return { week: `W${idx + 1}`, completed: count };
  });

  const taskDistribution = Object.values(TaskStatus).map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  // Weekly productivity: completed tasks per day for the current week (Mon-Sun).
  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Mon
  const weekStart = now - todayIdx * DAY_MS;
  const weeklyProductivity = weekDayLabels.map((label, idx) => {
    const dayStart = weekStart + idx * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const count = completed.filter((t) => t.updatedAt.getTime() >= dayStart && t.updatedAt.getTime() < dayEnd).length;
    return { day: label, tasks: count };
  });

  return {
    stats: {
      projects: projects.length,
      teams: teams.length,
      tasks: tasks.length,
      completed: completed.length,
      pending: pending.length,
      late: late.length,
      deadlines: upcomingDeadlines.length,
      rating: Number(avgRating.toFixed(1)),
    },
    upcomingDeadlines,
    taskCompletionTrend,
    taskDistribution,
    weeklyProductivity,
  };
}

export async function getReportsData(user: User) {
  const [teams, tasks] = await Promise.all([
    prisma.team.findMany({
      where: teamVisibilityWhere(user),
      include: { members: true, tasks: true },
    }),
    prisma.task.findMany({ where: taskVisibilityWhere(user) }),
  ]);

  const now = Date.now();

  const teamEfficiency = teams.map((team) => {
    const teamTasks = team.tasks;
    const completedCount = teamTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const efficiency = teamTasks.length ? Math.round((completedCount / teamTasks.length) * 100) : 0;
    return { team: team.name, efficiency, completed: completedCount, total: teamTasks.length };
  });

  const completionTrend = Array.from({ length: 6 }).map((_, idx) => {
    const weeksAgo = 5 - idx;
    const start = now - (weeksAgo + 1) * 7 * DAY_MS;
    const end = now - weeksAgo * 7 * DAY_MS;
    const completed = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED && t.updatedAt.getTime() >= start && t.updatedAt.getTime() < end
    ).length;
    return { week: `W${idx + 1}`, completed };
  });

  const taskDistribution = Object.values(TaskStatus).map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  const lateSubmissions = tasks.filter(
    (t) => t.dueDate && t.dueDate.getTime() < now && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED
  ).length;

  return { teamEfficiency, completionTrend, taskDistribution, lateSubmissions };
}
