import type { Department, Role, TaskStatus } from "../types";

export const SEMESTER = "Summer 2026";

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: "Dr. M. Asif", email: "admin@uiu.edu", password: "admin123", role: "SUPER_ADMIN" },
  { name: "Dr. Sara Ahmed", email: "faculty@uiu.edu", password: "faculty123", role: "FACULTY" },
  { name: "Rafiq Hasan", email: "ta@uiu.edu", password: "ta123", role: "TA" },
  { name: "Ayesha Khan", email: "ayesha@uiu.edu", password: "pass123", role: "LEADER" },
  { name: "Sana Malik", email: "sana@uiu.edu", password: "pass123", role: "LEADER" },
  { name: "Zaid Rahman", email: "zaid@uiu.edu", password: "pass123", role: "STUDENT" },
  { name: "Omar Farooq", email: "omar@uiu.edu", password: "pass123", role: "STUDENT" },
  { name: "Nadia Hossain", email: "nadia@uiu.edu", password: "pass123", role: "STUDENT" },
  { name: "Bilal Ahmed", email: "bilal@uiu.edu", password: "pass123", role: "STUDENT" },
];

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: "CS", label: "Computer Science" },
  { value: "SE", label: "Software Engineering" },
  { value: "IS", label: "Information Systems" },
  { value: "EEE", label: "Electrical & Electronic Engineering" },
  { value: "BBA", label: "Business Administration" },
  { value: "ENG", label: "English" },
];

export const KANBAN_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "To Do" },
  { status: "STARTED", label: "Started" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "REVIEW", label: "Review" },
  { status: "TESTING", label: "Testing" },
  { status: "COMPLETED", label: "Completed" },
  { status: "CANCELLED", label: "Cancelled" },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  STARTED: "Started",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  TESTING: "Testing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-700 border-blue-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

export const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  ON_HOLD: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export const SPRINT_STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-blue-50 text-blue-700",
};
