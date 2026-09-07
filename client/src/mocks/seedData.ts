// Raw, normalized demo data for frontend-only "demo mode" (npm run dev:demo).
// Mirrors server/prisma/seed.ts in names/structure so the demo looks and
// feels identical to the real, backend-connected app. Every array here
// stores foreign keys only (like DB rows) — nested/joined shapes are
// assembled at read time in store.ts, the same way the real API does it.

import type { Department, NotificationType, Priority, ProjectStatus, ReviewStatus, Role, TaskPriority, TaskStatus } from "../types";

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export interface RawUser {
  id: string;
  email: string;
  password: string; // demo-mode only: plain text, never used outside this mock module
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
}

export const rawUsers: RawUser[] = [
  {
    id: "u-admin",
    email: "admin@uiu.edu",
    password: "admin123",
    name: "Dr. M. Asif",
    initials: "DA",
    avatarColor: "#F59E0B",
    role: "SUPER_ADMIN",
    department: "CS",
    title: "Head of Department",
    bio: "Overseeing the Task Delegation and Tracking System for the CS department.",
    skills: ["Leadership", "Systems Design", "Academic Administration"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-120),
    updatedAt: daysFromNow(-2),
  },
  {
    id: "u-faculty",
    email: "faculty@uiu.edu",
    password: "faculty123",
    name: "Dr. Sara Ahmed",
    initials: "DA",
    avatarColor: "#3B82F6",
    role: "FACULTY",
    department: "CS",
    title: "Associate Professor",
    bio: "Supervising capstone and research projects in software engineering.",
    skills: ["Software Engineering", "Machine Learning", "Project Supervision"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-118),
    updatedAt: daysFromNow(-3),
  },
  {
    id: "u-ta",
    email: "ta@uiu.edu",
    password: "ta123",
    name: "Rafiq Hasan",
    initials: "RH",
    avatarColor: "#10B981",
    role: "TA",
    department: "CS",
    title: "Teaching Assistant",
    bio: "Assisting with project reviews and grading across CS courses.",
    skills: ["Code Review", "React", "Node.js"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-110),
    updatedAt: daysFromNow(-5),
  },
  {
    id: "u-ayesha",
    email: "ayesha@uiu.edu",
    password: "pass123",
    name: "Ayesha Khan",
    initials: "AK",
    avatarColor: "#8B5CF6",
    role: "LEADER",
    department: "CS",
    title: "Team Leader",
    bio: "Leading the Falcons team on the attendance system project.",
    skills: ["React", "TypeScript", "Team Management"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-100),
    updatedAt: daysFromNow(-1),
  },
  {
    id: "u-sana",
    email: "sana@uiu.edu",
    password: "pass123",
    name: "Sana Malik",
    initials: "SM",
    avatarColor: "#EC4899",
    role: "LEADER",
    department: "SE",
    title: "Team Leader",
    bio: "Leading the Phoenix team on the event management portal.",
    skills: ["Node.js", "PostgreSQL", "Agile Planning"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-100),
    updatedAt: daysFromNow(-4),
  },
  {
    id: "u-zaid",
    email: "zaid@uiu.edu",
    password: "pass123",
    name: "Zaid Rahman",
    initials: "ZR",
    avatarColor: "#EF4444",
    role: "STUDENT",
    department: "CS",
    title: "Backend Developer",
    bio: "Working on API integrations for the attendance system.",
    skills: ["Node.js", "Express", "Prisma"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-95),
    updatedAt: daysFromNow(-1),
  },
  {
    id: "u-omar",
    email: "omar@uiu.edu",
    password: "pass123",
    name: "Omar Farooq",
    initials: "OF",
    avatarColor: "#14B8A6",
    role: "STUDENT",
    department: "CS",
    title: "Frontend Developer",
    bio: "Building the UI components for the attendance dashboard.",
    skills: ["React", "Tailwind CSS", "UI Design"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-95),
    updatedAt: daysFromNow(-2),
  },
  {
    id: "u-nadia",
    email: "nadia@uiu.edu",
    password: "pass123",
    name: "Nadia Hossain",
    initials: "NH",
    avatarColor: "#6366F1",
    role: "STUDENT",
    department: "SE",
    title: "QA Engineer",
    bio: "Testing and documentation for the event management portal.",
    skills: ["QA Testing", "Documentation", "Figma"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-95),
    updatedAt: daysFromNow(-3),
  },
  {
    id: "u-bilal",
    email: "bilal@uiu.edu",
    password: "pass123",
    name: "Bilal Ahmed",
    initials: "BA",
    avatarColor: "#F59E0B",
    role: "STUDENT",
    department: "SE",
    title: "Full Stack Developer",
    bio: "Contributing across the stack on the event management portal.",
    skills: ["React", "Node.js", "PostgreSQL"],
    semester: "Summer 2026",
    createdAt: daysFromNow(-95),
    updatedAt: daysFromNow(-1),
  },
];

export interface RawProject {
  id: string;
  name: string;
  courseCode: string;
  description: string;
  priority: Priority;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  supervisorId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const rawProjects: RawProject[] = [
  {
    id: "p-attendance",
    name: "AI-Powered Attendance System",
    courseCode: "CSE327",
    description: "A facial-recognition based attendance system for classroom sessions, built as a capstone project.",
    priority: "HIGH",
    status: "ACTIVE",
    progress: 55,
    deadline: daysFromNow(38),
    supervisorId: "u-faculty",
    createdById: "u-faculty",
    createdAt: daysFromNow(-60),
    updatedAt: daysFromNow(-1),
  },
  {
    id: "p-events",
    name: "University Event Management Portal",
    courseCode: "CSE440",
    description: "A centralized portal for students and clubs to create, manage, and register for university events.",
    priority: "MEDIUM",
    status: "ACTIVE",
    progress: 40,
    deadline: daysFromNow(54),
    supervisorId: "u-faculty",
    createdById: "u-admin",
    createdAt: daysFromNow(-58),
    updatedAt: daysFromNow(-2),
  },
  {
    id: "p-library",
    name: "Smart Library Recommendation Engine",
    courseCode: "CSE499",
    description: "A recommendation engine that suggests library resources to students based on course enrollment and borrowing history.",
    priority: "CRITICAL",
    status: "PLANNING",
    progress: 15,
    deadline: daysFromNow(22),
    supervisorId: "u-faculty",
    createdById: "u-faculty",
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-1),
  },
];

export interface RawTeam {
  id: string;
  name: string;
  projectId: string;
  leaderId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const rawTeams: RawTeam[] = [
  { id: "team-falcons", name: "Falcons", projectId: "p-attendance", leaderId: "u-ayesha", createdById: "u-faculty", createdAt: daysFromNow(-58), updatedAt: daysFromNow(-58) },
  { id: "team-phoenix", name: "Phoenix", projectId: "p-events", leaderId: "u-sana", createdById: "u-admin", createdAt: daysFromNow(-56), updatedAt: daysFromNow(-56) },
  { id: "team-ravens", name: "Ravens", projectId: "p-library", leaderId: "u-ayesha", createdById: "u-faculty", createdAt: daysFromNow(-29), updatedAt: daysFromNow(-29) },
];

export interface RawTeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
}

export const rawTeamMembers: RawTeamMember[] = [
  { id: "tm-1", teamId: "team-falcons", userId: "u-ayesha", joinedAt: daysFromNow(-58) },
  { id: "tm-2", teamId: "team-falcons", userId: "u-zaid", joinedAt: daysFromNow(-58) },
  { id: "tm-3", teamId: "team-falcons", userId: "u-omar", joinedAt: daysFromNow(-58) },
  { id: "tm-4", teamId: "team-phoenix", userId: "u-sana", joinedAt: daysFromNow(-56) },
  { id: "tm-5", teamId: "team-phoenix", userId: "u-nadia", joinedAt: daysFromNow(-56) },
  { id: "tm-6", teamId: "team-phoenix", userId: "u-bilal", joinedAt: daysFromNow(-56) },
  { id: "tm-7", teamId: "team-ravens", userId: "u-ayesha", joinedAt: daysFromNow(-29) },
  { id: "tm-8", teamId: "team-ravens", userId: "u-omar", joinedAt: daysFromNow(-29) },
  { id: "tm-9", teamId: "team-ravens", userId: "u-nadia", joinedAt: daysFromNow(-29) },
];

export interface RawTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  projectId: string;
  teamId: string | null;
  dueDate: string | null;
  progress: number;
  tags: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const rawTasks: RawTask[] = [
  { id: "t-1", title: "Design database schema for attendance logs", description: "Model students, sessions, and attendance records.", priority: "HIGH", status: "COMPLETED", assigneeId: "u-zaid", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(-20), progress: 100, tags: ["backend", "database"], createdById: "u-faculty", createdAt: daysFromNow(-40), updatedAt: daysFromNow(-19) },
  { id: "t-2", title: "Build face-recognition capture module", description: "Integrate camera capture with the recognition pipeline.", priority: "URGENT", status: "IN_PROGRESS", assigneeId: "u-zaid", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(5), progress: 60, tags: ["backend", "ml"], createdById: "u-faculty", createdAt: daysFromNow(-35), updatedAt: daysFromNow(-1) },
  { id: "t-3", title: "Attendance dashboard UI", description: "Build the instructor-facing dashboard showing live attendance.", priority: "HIGH", status: "REVIEW", assigneeId: "u-omar", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(2), progress: 90, tags: ["frontend", "ui"], createdById: "u-faculty", createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "t-4", title: "Student self-check-in page", description: "Mobile-friendly page for students to confirm their own attendance.", priority: "MEDIUM", status: "TESTING", assigneeId: "u-omar", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(-3), progress: 85, tags: ["frontend"], createdById: "u-faculty", createdAt: daysFromNow(-28), updatedAt: daysFromNow(-2) },
  { id: "t-5", title: "Weekly attendance report export", description: "Generate CSV/PDF export of weekly attendance summaries.", priority: "LOW", status: "TODO", assigneeId: "u-ayesha", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(12), progress: 0, tags: ["reports"], createdById: "u-faculty", createdAt: daysFromNow(-10), updatedAt: daysFromNow(-10) },
  { id: "t-6", title: "Set up CI pipeline", description: "Automated lint/test/build pipeline for the attendance repo.", priority: "MEDIUM", status: "STARTED", assigneeId: "u-zaid", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(8), progress: 25, tags: ["devops"], createdById: "u-faculty", createdAt: daysFromNow(-9), updatedAt: daysFromNow(-1) },
  { id: "t-7", title: "Draft privacy policy for facial data", description: "Legal/ethics writeup for biometric data handling.", priority: "MEDIUM", status: "BACKLOG", assigneeId: "u-ayesha", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(25), progress: 0, tags: ["docs"], createdById: "u-faculty", createdAt: daysFromNow(-5), updatedAt: daysFromNow(-5) },
  { id: "t-8", title: "Legacy barcode scanner integration", description: "Superseded by facial recognition approach.", priority: "LOW", status: "CANCELLED", assigneeId: "u-omar", projectId: "p-attendance", teamId: "team-falcons", dueDate: daysFromNow(-10), progress: 0, tags: ["hardware"], createdById: "u-faculty", createdAt: daysFromNow(-45), updatedAt: daysFromNow(-10) },

  { id: "t-9", title: "Event creation form", description: "Multi-step form for clubs to create new events.", priority: "HIGH", status: "COMPLETED", assigneeId: "u-bilal", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(-15), progress: 100, tags: ["frontend"], createdById: "u-faculty", createdAt: daysFromNow(-40), updatedAt: daysFromNow(-14) },
  { id: "t-10", title: "RSVP and ticketing API", description: "Endpoints for registering, cancelling, and listing RSVPs.", priority: "HIGH", status: "IN_PROGRESS", assigneeId: "u-bilal", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(6), progress: 50, tags: ["backend"], createdById: "u-faculty", createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "t-11", title: "QA test plan for registration flow", description: "Write and execute test cases for the RSVP flow.", priority: "MEDIUM", status: "REVIEW", assigneeId: "u-nadia", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(-1), progress: 80, tags: ["qa"], createdById: "u-faculty", createdAt: daysFromNow(-20), updatedAt: daysFromNow(-1) },
  { id: "t-12", title: "Email notification templates", description: "Design confirmation and reminder email templates.", priority: "LOW", status: "TESTING", assigneeId: "u-nadia", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(3), progress: 70, tags: ["design"], createdById: "u-faculty", createdAt: daysFromNow(-18), updatedAt: daysFromNow(-2) },
  { id: "t-13", title: "Club admin permissions", description: "Role-based permissions so club admins can only manage their own events.", priority: "MEDIUM", status: "TODO", assigneeId: "u-sana", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(15), progress: 0, tags: ["backend", "auth"], createdById: "u-faculty", createdAt: daysFromNow(-8), updatedAt: daysFromNow(-8) },
  { id: "t-14", title: "Event calendar view", description: "Monthly calendar view of upcoming campus events.", priority: "MEDIUM", status: "STARTED", assigneeId: "u-bilal", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(10), progress: 30, tags: ["frontend"], createdById: "u-faculty", createdAt: daysFromNow(-6), updatedAt: daysFromNow(-1) },
  { id: "t-15", title: "Analytics dashboard for club admins", description: "Show attendance and engagement metrics per event.", priority: "LOW", status: "BACKLOG", assigneeId: "u-sana", projectId: "p-events", teamId: "team-phoenix", dueDate: daysFromNow(30), progress: 0, tags: ["analytics"], createdById: "u-faculty", createdAt: daysFromNow(-4), updatedAt: daysFromNow(-4) },

  { id: "t-16", title: "Data pipeline for borrowing history", description: "ETL pipeline pulling library circulation data.", priority: "HIGH", status: "STARTED", assigneeId: "u-omar", projectId: "p-library", teamId: "team-ravens", dueDate: daysFromNow(9), progress: 35, tags: ["data"], createdById: "u-faculty", createdAt: daysFromNow(-15), updatedAt: daysFromNow(-1) },
  { id: "t-17", title: "Recommendation model prototype", description: "Baseline collaborative-filtering recommendation model.", priority: "URGENT", status: "TODO", assigneeId: "u-ayesha", projectId: "p-library", teamId: "team-ravens", dueDate: daysFromNow(18), progress: 0, tags: ["ml"], createdById: "u-faculty", createdAt: daysFromNow(-12), updatedAt: daysFromNow(-12) },
  { id: "t-18", title: "Literature review on recommender systems", description: "Summarize relevant academic papers for the approach section.", priority: "MEDIUM", status: "REVIEW", assigneeId: "u-nadia", projectId: "p-library", teamId: "team-ravens", dueDate: daysFromNow(-2), progress: 100, tags: ["research"], createdById: "u-faculty", createdAt: daysFromNow(-25), updatedAt: daysFromNow(-2) },
  { id: "t-19", title: "Project proposal document", description: "Formal proposal document for supervisor sign-off.", priority: "HIGH", status: "COMPLETED", assigneeId: "u-ayesha", projectId: "p-library", teamId: "team-ravens", dueDate: daysFromNow(-25), progress: 100, tags: ["docs"], createdById: "u-faculty", createdAt: daysFromNow(-29), updatedAt: daysFromNow(-24) },
];

export interface RawComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const rawComments: RawComment[] = [
  { id: "c-1", taskId: "t-2", userId: "u-ayesha", comment: "How's the recognition accuracy looking on the test set?", createdAt: daysFromNow(-2), updatedAt: daysFromNow(-2) },
  { id: "c-2", taskId: "t-2", userId: "u-zaid", comment: "About 94% so far, still tuning the lighting conditions.", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "c-3", taskId: "t-3", userId: "u-faculty", comment: "Looks great — please add a loading state for the live feed.", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "c-4", taskId: "t-10", userId: "u-sana", comment: "Let's make sure cancellations trigger a refund webhook too.", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "c-5", taskId: "t-18", userId: "u-faculty", comment: "Solid summary, please add two more recent papers from 2025.", createdAt: daysFromNow(-2), updatedAt: daysFromNow(-2) },
];

export interface RawReview {
  id: string;
  taskId: string;
  reviewerId: string;
  submittedById: string;
  status: ReviewStatus;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export const rawReviews: RawReview[] = [
  { id: "rv-1", taskId: "t-3", reviewerId: "u-faculty", submittedById: "u-omar", status: "PENDING_REVIEW", rating: null, feedback: null, createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "rv-2", taskId: "t-4", reviewerId: "u-faculty", submittedById: "u-omar", status: "CHANGES_REQUESTED", rating: 3, feedback: "Please handle the offline check-in edge case before resubmitting.", createdAt: daysFromNow(-3), updatedAt: daysFromNow(-2) },
  { id: "rv-3", taskId: "t-1", reviewerId: "u-faculty", submittedById: "u-zaid", status: "APPROVED", rating: 5, feedback: "Clean schema, well-indexed. Approved.", createdAt: daysFromNow(-19), updatedAt: daysFromNow(-18) },
  { id: "rv-4", taskId: "t-11", reviewerId: "u-faculty", submittedById: "u-nadia", status: "PENDING_REVIEW", rating: null, feedback: null, createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "rv-5", taskId: "t-18", reviewerId: "u-faculty", submittedById: "u-nadia", status: "APPROVED", rating: 4, feedback: "Good coverage of the literature, nicely organized.", createdAt: daysFromNow(-2), updatedAt: daysFromNow(-1) },
  { id: "rv-6", taskId: "t-19", reviewerId: "u-faculty", submittedById: "u-ayesha", status: "APPROVED", rating: 5, feedback: "Comprehensive proposal, approved for supervisor sign-off.", createdAt: daysFromNow(-24), updatedAt: daysFromNow(-23) },
  { id: "rv-7", taskId: "t-8", reviewerId: "u-faculty", submittedById: "u-omar", status: "REJECTED", rating: 1, feedback: "Superseded by the facial recognition approach; closing this out.", createdAt: daysFromNow(-10), updatedAt: daysFromNow(-9) },
];

export interface RawPerformance {
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
}

export const rawPerformance: RawPerformance[] = [
  { id: "pf-1", userId: "u-ayesha", projectId: "p-attendance", score: 88, completed: 1, late: 0, pending: 2, attendance: 96, points: 420, rating: 4.6, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "pf-2", userId: "u-ayesha", projectId: "p-library", score: 82, completed: 1, late: 0, pending: 1, attendance: 94, points: 310, rating: 4.4, createdAt: daysFromNow(-20), updatedAt: daysFromNow(-1) },
  { id: "pf-3", userId: "u-sana", projectId: "p-events", score: 85, completed: 1, late: 0, pending: 2, attendance: 98, points: 390, rating: 4.5, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "pf-4", userId: "u-zaid", projectId: "p-attendance", score: 91, completed: 1, late: 0, pending: 2, attendance: 97, points: 450, rating: 4.8, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "pf-5", userId: "u-omar", projectId: "p-attendance", score: 74, completed: 0, late: 1, pending: 2, attendance: 88, points: 260, rating: 3.9, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "pf-6", userId: "u-omar", projectId: "p-library", score: 70, completed: 0, late: 0, pending: 1, attendance: 90, points: 200, rating: 3.8, createdAt: daysFromNow(-20), updatedAt: daysFromNow(-1) },
  { id: "pf-7", userId: "u-nadia", projectId: "p-events", score: 80, completed: 0, late: 1, pending: 1, attendance: 92, points: 300, rating: 4.1, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
  { id: "pf-8", userId: "u-nadia", projectId: "p-library", score: 89, completed: 1, late: 0, pending: 0, attendance: 96, points: 340, rating: 4.7, createdAt: daysFromNow(-20), updatedAt: daysFromNow(-1) },
  { id: "pf-9", userId: "u-bilal", projectId: "p-events", score: 78, completed: 1, late: 0, pending: 1, attendance: 91, points: 280, rating: 4.0, createdAt: daysFromNow(-30), updatedAt: daysFromNow(-1) },
];

export interface RawNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export const rawNotifications: RawNotification[] = [
  { id: "n-1", userId: "u-zaid", type: "TASK", title: "New task assigned", body: 'You have been assigned to "Build face-recognition capture module".', read: false, createdAt: daysFromNow(-1) },
  { id: "n-2", userId: "u-omar", type: "REVIEW", title: "Changes requested", body: 'Your submission for "Student self-check-in page" needs changes.', read: false, createdAt: daysFromNow(-2) },
  { id: "n-3", userId: "u-nadia", type: "DEADLINE", title: "Deadline approaching", body: '"Email notification templates" is due in 3 days.', read: true, createdAt: daysFromNow(-3) },
  { id: "n-4", userId: "u-bilal", type: "MENTION", title: "You were mentioned", body: "Sana Malik mentioned you in a comment on the RSVP API task.", read: false, createdAt: daysFromNow(-1) },
  { id: "n-5", userId: "u-ayesha", type: "UPLOAD", title: "New attachment", body: "A new design file was uploaded to the attendance dashboard task.", read: true, createdAt: daysFromNow(-4) },
  { id: "n-6", userId: "u-faculty", type: "REVIEW", title: "New submission for review", body: "Omar Farooq submitted a task for review.", read: false, createdAt: daysFromNow(-1) },
  { id: "n-7", userId: "u-sana", type: "TASK", title: "Task status changed", body: '"Event creation form" was marked complete.', read: true, createdAt: daysFromNow(-14) },
  { id: "n-8", userId: "u-ta", type: "REVIEW", title: "Pending reviews", body: "There are 2 submissions awaiting review.", read: false, createdAt: daysFromNow(-1) },
  { id: "n-9", userId: "u-admin", type: "TASK", title: "Weekly summary", body: "3 projects are on track this week across the department.", read: false, createdAt: daysFromNow(-1) },
];

export interface RawAuditLog {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export const rawAuditLogs: RawAuditLog[] = [
  { id: "al-1", actorId: "u-faculty", action: "PROJECT_CREATE", targetType: "Project", targetId: "p-attendance", details: JSON.stringify({ name: "AI-Powered Attendance System" }), createdAt: daysFromNow(-60) },
  { id: "al-2", actorId: "u-admin", action: "PROJECT_CREATE", targetType: "Project", targetId: "p-events", details: JSON.stringify({ name: "University Event Management Portal" }), createdAt: daysFromNow(-58) },
  { id: "al-3", actorId: "u-faculty", action: "TEAM_CREATE", targetType: "Team", targetId: "team-falcons", details: JSON.stringify({ name: "Falcons" }), createdAt: daysFromNow(-58) },
  { id: "al-4", actorId: "u-admin", action: "TEAM_CREATE", targetType: "Team", targetId: "team-phoenix", details: JSON.stringify({ name: "Phoenix" }), createdAt: daysFromNow(-56) },
  { id: "al-5", actorId: "u-admin", action: "ROLE_CHANGE", targetType: "User", targetId: "u-ayesha", details: JSON.stringify({ from: "STUDENT", to: "LEADER", targetName: "Ayesha Khan" }), createdAt: daysFromNow(-90) },
];
