export type Role = "SUPER_ADMIN" | "FACULTY" | "TA" | "LEADER" | "STUDENT";
export type Department = "CS" | "SE" | "IS" | "EEE" | "BBA" | "ENG";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "STARTED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "TESTING"
  | "COMPLETED"
  | "CANCELLED";
export type ReviewStatus = "PENDING_REVIEW" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
export type NotificationType = "TASK" | "DEADLINE" | "REVIEW" | "MENTION" | "UPLOAD";
export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED";

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: Role;
  department: Department | null;
  title: string | null;
  bio: string | null;
  skills: string[];
  semester: string | null;
  createdAt: string;
  updatedAt: string;
  roleLabel?: string;
}

export interface Project {
  id: string;
  name: string;
  courseCode: string;
  description: string | null;
  priority: Priority;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  supervisorId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  supervisor: User;
  createdBy: User;
  teams: Team[];
  _count?: { tasks: number };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  projectId: string;
  leaderId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  leader: User;
  createdBy?: User;
  members: TeamMember[];
  tasks?: Task[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  uploadedById: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  submittedById: string;
  status: ReviewStatus;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  task: Task;
  reviewer: User;
  submittedBy: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  projectId: string;
  teamId: string | null;
  sprintId: string | null;
  dueDate: string | null;
  progress: number;
  tags: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee: User | null;
  createdBy: User;
  project: Project;
  team: (Team & { members: TeamMember[] }) | null;
  sprint?: Sprint | null;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  reviews?: Review[];
  _count?: { comments: number };
}

export interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  projectId: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  createdBy?: User;
  tasks?: Task[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Performance {
  id: string;
  userId: string;
  projectId: string;
  score: number;
  completed: number;
  late: number;
  pending: number;
  attendance: number;
  points: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  project: Project;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
  actor: User | null;
}

export interface HelpArticle {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}

export interface DashboardStats {
  stats: {
    projects: number;
    teams: number;
    tasks: number;
    completed: number;
    pending: number;
    late: number;
    deadlines: number;
    rating: number;
  };
  upcomingDeadlines: { id: string; title: string; dueDate: string }[];
  taskCompletionTrend: { week: string; completed: number }[];
  taskDistribution: { status: TaskStatus; count: number }[];
  weeklyProductivity: { day: string; tasks: number }[];
}

export interface ReportsData {
  teamEfficiency: { team: string; efficiency: number; completed: number; total: number }[];
  completionTrend: { week: string; completed: number }[];
  taskDistribution: { status: TaskStatus; count: number }[];
  lateSubmissions: number;
}

export type PermissionKey =
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "review"
  | "approve"
  | "export"
  | "manageUsers"
  | "manageRoles"
  | "manageReports";

export type PermissionMatrix = Record<Role, Record<PermissionKey, boolean>>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
