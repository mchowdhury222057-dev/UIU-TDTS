import { Department, PrismaClient, Priority, ProjectStatus, Role, TaskPriority, TaskStatus, ReviewStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Resetting database...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.performance.deleteMany();
  await prisma.review.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");

  const [admin, faculty, ta, ayesha, sana, zaid, omar, nadia, bilal] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@uiu.edu",
        passwordHash: await hash("admin123"),
        name: "Dr. M. Asif",
        initials: initials("Dr. M. Asif"),
        avatarColor: "#F59E0B",
        role: Role.SUPER_ADMIN,
        department: Department.CS,
        title: "Head of Department",
        bio: "Overseeing the Task Delegation and Tracking System for the CS department.",
        skills: ["Leadership", "Systems Design", "Academic Administration"],
      },
    }),
    prisma.user.create({
      data: {
        email: "faculty@uiu.edu",
        passwordHash: await hash("faculty123"),
        name: "Dr. Sara Ahmed",
        initials: initials("Dr. Sara Ahmed"),
        avatarColor: "#3B82F6",
        role: Role.FACULTY,
        department: Department.CS,
        title: "Associate Professor",
        bio: "Supervising capstone and research projects in software engineering.",
        skills: ["Software Engineering", "Machine Learning", "Project Supervision"],
      },
    }),
    prisma.user.create({
      data: {
        email: "ta@uiu.edu",
        passwordHash: await hash("ta123"),
        name: "Rafiq Hasan",
        initials: initials("Rafiq Hasan"),
        avatarColor: "#10B981",
        role: Role.TA,
        department: Department.CS,
        title: "Teaching Assistant",
        bio: "Assisting with project reviews and grading across CS courses.",
        skills: ["Code Review", "React", "Node.js"],
      },
    }),
    prisma.user.create({
      data: {
        email: "ayesha@uiu.edu",
        passwordHash: await hash("pass123"),
        name: "Ayesha Khan",
        initials: initials("Ayesha Khan"),
        avatarColor: "#8B5CF6",
        role: Role.LEADER,
        department: Department.CS,
        title: "Team Leader",
        bio: "Leading the Falcons team on the attendance system project.",
        skills: ["React", "TypeScript", "Team Management"],
      },
    }),
    prisma.user.create({
      data: {
        email: "sana@uiu.edu",
        passwordHash: await hash("pass123"),
        name: "Sana Malik",
        initials: initials("Sana Malik"),
        avatarColor: "#EC4899",
        role: Role.LEADER,
        department: Department.SE,
        title: "Team Leader",
        bio: "Leading the Phoenix team on the event management portal.",
        skills: ["Node.js", "PostgreSQL", "Agile Planning"],
      },
    }),
    prisma.user.create({
      data: {
        email: "zaid@uiu.edu",
        passwordHash: await hash("pass123"),
        name: "Zaid Rahman",
        initials: initials("Zaid Rahman"),
        avatarColor: "#EF4444",
        role: Role.STUDENT,
        department: Department.CS,
        title: "Backend Developer",
        bio: "Working on API integrations for the attendance system.",
        skills: ["Node.js", "Express", "Prisma"],
      },
    }),
    prisma.user.create({
      data: {
        email: "omar@uiu.edu",
        passwordHash: await hash("pass123"),
        name: "Omar Farooq",
        initials: initials("Omar Farooq"),
        avatarColor: "#14B8A6",
        role: Role.STUDENT,
        department: Department.CS,
        title: "Frontend Developer",
        bio: "Building the UI components for the attendance dashboard.",
        skills: ["React", "Tailwind CSS", "UI Design"],
      },
    }),
    prisma.user.create({
      data: {
        email: "nadia@uiu.edu",
        passwordHash: await hash("pass123"),
        name: "Nadia Hossain",
        initials: initials("Nadia Hossain"),
        avatarColor: "#6366F1",
        role: Role.STUDENT,
        department: Department.SE,
        title: "QA Engineer",
        bio: "Testing and documentation for the event management portal.",
        skills: ["QA Testing", "Documentation", "Figma"],
      },
    }),
    prisma.user.create({
      data: {
        email: "bilal@uiu.edu",
        passwordHash: await hash("pass123"),
        name: "Bilal Ahmed",
        initials: initials("Bilal Ahmed"),
        avatarColor: "#F59E0B",
        role: Role.STUDENT,
        department: Department.SE,
        title: "Full Stack Developer",
        bio: "Contributing across the stack on the event management portal.",
        skills: ["React", "Node.js", "PostgreSQL"],
      },
    }),
  ]);

  console.log("Creating projects...");

  const attendanceProject = await prisma.project.create({
    data: {
      name: "AI-Powered Attendance System",
      courseCode: "CSE327",
      description: "A facial-recognition based attendance system for classroom sessions, built as a capstone project.",
      priority: Priority.HIGH,
      status: ProjectStatus.ACTIVE,
      progress: 55,
      deadline: daysFromNow(38),
      supervisorId: faculty.id,
      createdById: faculty.id,
    },
  });

  const eventPortalProject = await prisma.project.create({
    data: {
      name: "University Event Management Portal",
      courseCode: "CSE440",
      description: "A centralized portal for students and clubs to create, manage, and register for university events.",
      priority: Priority.MEDIUM,
      status: ProjectStatus.ACTIVE,
      progress: 40,
      deadline: daysFromNow(54),
      supervisorId: faculty.id,
      createdById: admin.id,
    },
  });

  const libraryProject = await prisma.project.create({
    data: {
      name: "Smart Library Recommendation Engine",
      courseCode: "CSE499",
      description: "A recommendation engine that suggests library resources to students based on course enrollment and borrowing history.",
      priority: Priority.CRITICAL,
      status: ProjectStatus.PLANNING,
      progress: 15,
      deadline: daysFromNow(22),
      supervisorId: faculty.id,
      createdById: faculty.id,
    },
  });

  console.log("Creating teams...");

  const falcons = await prisma.team.create({
    data: {
      name: "Falcons",
      projectId: attendanceProject.id,
      leaderId: ayesha.id,
      createdById: faculty.id,
      members: {
        create: [{ userId: ayesha.id }, { userId: zaid.id }, { userId: omar.id }],
      },
    },
  });

  const phoenix = await prisma.team.create({
    data: {
      name: "Phoenix",
      projectId: eventPortalProject.id,
      leaderId: sana.id,
      createdById: admin.id,
      members: {
        create: [{ userId: sana.id }, { userId: nadia.id }, { userId: bilal.id }],
      },
    },
  });

  const ravens = await prisma.team.create({
    data: {
      name: "Ravens",
      projectId: libraryProject.id,
      leaderId: ayesha.id,
      createdById: faculty.id,
      members: {
        create: [{ userId: ayesha.id }, { userId: omar.id }, { userId: nadia.id }],
      },
    },
  });

  console.log("Creating tasks...");

  interface TaskSeed {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assigneeId: string;
    projectId: string;
    teamId: string;
    dueDateOffset: number;
    progress: number;
    tags: string[];
  }

  const taskSeeds: TaskSeed[] = [
    // Falcons / Attendance System
    { title: "Design database schema for attendance logs", description: "Model students, sessions, and attendance records.", priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, assigneeId: zaid.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: -20, progress: 100, tags: ["backend", "database"] },
    { title: "Build face-recognition capture module", description: "Integrate camera capture with the recognition pipeline.", priority: TaskPriority.URGENT, status: TaskStatus.IN_PROGRESS, assigneeId: zaid.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: 5, progress: 60, tags: ["backend", "ml"] },
    { title: "Attendance dashboard UI", description: "Build the instructor-facing dashboard showing live attendance.", priority: TaskPriority.HIGH, status: TaskStatus.REVIEW, assigneeId: omar.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: 2, progress: 90, tags: ["frontend", "ui"] },
    { title: "Student self-check-in page", description: "Mobile-friendly page for students to confirm their own attendance.", priority: TaskPriority.MEDIUM, status: TaskStatus.TESTING, assigneeId: omar.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: -3, progress: 85, tags: ["frontend"] },
    { title: "Weekly attendance report export", description: "Generate CSV/PDF export of weekly attendance summaries.", priority: TaskPriority.LOW, status: TaskStatus.TODO, assigneeId: ayesha.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: 12, progress: 0, tags: ["reports"] },
    { title: "Set up CI pipeline", description: "Automated lint/test/build pipeline for the attendance repo.", priority: TaskPriority.MEDIUM, status: TaskStatus.STARTED, assigneeId: zaid.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: 8, progress: 25, tags: ["devops"] },
    { title: "Draft privacy policy for facial data", description: "Legal/ethics writeup for biometric data handling.", priority: TaskPriority.MEDIUM, status: TaskStatus.BACKLOG, assigneeId: ayesha.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: 25, progress: 0, tags: ["docs"] },
    { title: "Legacy barcode scanner integration", description: "Superseded by facial recognition approach.", priority: TaskPriority.LOW, status: TaskStatus.CANCELLED, assigneeId: omar.id, projectId: attendanceProject.id, teamId: falcons.id, dueDateOffset: -10, progress: 0, tags: ["hardware"] },

    // Phoenix / Event Portal
    { title: "Event creation form", description: "Multi-step form for clubs to create new events.", priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, assigneeId: bilal.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: -15, progress: 100, tags: ["frontend"] },
    { title: "RSVP and ticketing API", description: "Endpoints for registering, cancelling, and listing RSVPs.", priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, assigneeId: bilal.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: 6, progress: 50, tags: ["backend"] },
    { title: "QA test plan for registration flow", description: "Write and execute test cases for the RSVP flow.", priority: TaskPriority.MEDIUM, status: TaskStatus.REVIEW, assigneeId: nadia.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: -1, progress: 80, tags: ["qa"] },
    { title: "Email notification templates", description: "Design confirmation and reminder email templates.", priority: TaskPriority.LOW, status: TaskStatus.TESTING, assigneeId: nadia.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: 3, progress: 70, tags: ["design"] },
    { title: "Club admin permissions", description: "Role-based permissions so club admins can only manage their own events.", priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, assigneeId: sana.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: 15, progress: 0, tags: ["backend", "auth"] },
    { title: "Event calendar view", description: "Monthly calendar view of upcoming campus events.", priority: TaskPriority.MEDIUM, status: TaskStatus.STARTED, assigneeId: bilal.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: 10, progress: 30, tags: ["frontend"] },
    { title: "Analytics dashboard for club admins", description: "Show attendance and engagement metrics per event.", priority: TaskPriority.LOW, status: TaskStatus.BACKLOG, assigneeId: sana.id, projectId: eventPortalProject.id, teamId: phoenix.id, dueDateOffset: 30, progress: 0, tags: ["analytics"] },

    // Ravens / Library Recommendation Engine
    { title: "Data pipeline for borrowing history", description: "ETL pipeline pulling library circulation data.", priority: TaskPriority.HIGH, status: TaskStatus.STARTED, assigneeId: omar.id, projectId: libraryProject.id, teamId: ravens.id, dueDateOffset: 9, progress: 35, tags: ["data"] },
    { title: "Recommendation model prototype", description: "Baseline collaborative-filtering recommendation model.", priority: TaskPriority.CRITICAL, status: TaskStatus.TODO, assigneeId: ayesha.id, projectId: libraryProject.id, teamId: ravens.id, dueDateOffset: 18, progress: 0, tags: ["ml"] },
    { title: "Literature review on recommender systems", description: "Summarize relevant academic papers for the approach section.", priority: TaskPriority.MEDIUM, status: TaskStatus.REVIEW, assigneeId: nadia.id, projectId: libraryProject.id, teamId: ravens.id, dueDateOffset: -2, progress: 100, tags: ["research"] },
    { title: "Project proposal document", description: "Formal proposal document for supervisor sign-off.", priority: TaskPriority.HIGH, status: TaskStatus.COMPLETED, assigneeId: ayesha.id, projectId: libraryProject.id, teamId: ravens.id, dueDateOffset: -25, progress: 100, tags: ["docs"] },
  ];

  const createdTasks = [];
  for (const t of taskSeeds) {
    const task = await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        assigneeId: t.assigneeId,
        projectId: t.projectId,
        teamId: t.teamId,
        dueDate: daysFromNow(t.dueDateOffset),
        progress: t.progress,
        tags: t.tags,
        createdById: faculty.id,
      },
    });
    createdTasks.push(task);
  }

  console.log("Creating comments...");

  await prisma.taskComment.createMany({
    data: [
      { taskId: createdTasks[1].id, userId: ayesha.id, comment: "How's the recognition accuracy looking on the test set?" },
      { taskId: createdTasks[1].id, userId: zaid.id, comment: "About 94% so far, still tuning the lighting conditions." },
      { taskId: createdTasks[2].id, userId: faculty.id, comment: "Looks great — please add a loading state for the live feed." },
      { taskId: createdTasks[9].id, userId: sana.id, comment: "Let's make sure cancellations trigger a refund webhook too." },
      { taskId: createdTasks[16].id, userId: faculty.id, comment: "Solid summary, please add two more recent papers from 2025." },
    ],
  });

  console.log("Creating reviews...");

  const reviewTargets = [
    { task: createdTasks[2], submittedBy: omar, status: ReviewStatus.PENDING_REVIEW, rating: null, feedback: null },
    { task: createdTasks[3], submittedBy: omar, status: ReviewStatus.CHANGES_REQUESTED, rating: 3, feedback: "Please handle the offline check-in edge case before resubmitting." },
    { task: createdTasks[0], submittedBy: zaid, status: ReviewStatus.APPROVED, rating: 5, feedback: "Clean schema, well-indexed. Approved." },
    { task: createdTasks[10], submittedBy: nadia, status: ReviewStatus.PENDING_REVIEW, rating: null, feedback: null },
    { task: createdTasks[16], submittedBy: nadia, status: ReviewStatus.APPROVED, rating: 4, feedback: "Good coverage of the literature, nicely organized." },
    { task: createdTasks[17], submittedBy: ayesha, status: ReviewStatus.APPROVED, rating: 5, feedback: "Comprehensive proposal, approved for supervisor sign-off." },
    { task: createdTasks[7], submittedBy: omar, status: ReviewStatus.REJECTED, rating: 1, feedback: "Superseded by the facial recognition approach; closing this out." },
  ];

  for (const r of reviewTargets) {
    await prisma.review.create({
      data: {
        taskId: r.task.id,
        submittedById: r.submittedBy.id,
        reviewerId: faculty.id,
        status: r.status,
        rating: r.rating ?? undefined,
        feedback: r.feedback ?? undefined,
      },
    });
  }

  console.log("Creating performance records...");

  const performanceSeeds = [
    { userId: ayesha.id, projectId: attendanceProject.id, score: 88, completed: 1, late: 0, pending: 2, attendance: 96, points: 420, rating: 4.6 },
    { userId: ayesha.id, projectId: libraryProject.id, score: 82, completed: 1, late: 0, pending: 1, attendance: 94, points: 310, rating: 4.4 },
    { userId: sana.id, projectId: eventPortalProject.id, score: 85, completed: 1, late: 0, pending: 2, attendance: 98, points: 390, rating: 4.5 },
    { userId: zaid.id, projectId: attendanceProject.id, score: 91, completed: 1, late: 0, pending: 2, attendance: 97, points: 450, rating: 4.8 },
    { userId: omar.id, projectId: attendanceProject.id, score: 74, completed: 0, late: 1, pending: 2, attendance: 88, points: 260, rating: 3.9 },
    { userId: omar.id, projectId: libraryProject.id, score: 70, completed: 0, late: 0, pending: 1, attendance: 90, points: 200, rating: 3.8 },
    { userId: nadia.id, projectId: eventPortalProject.id, score: 80, completed: 0, late: 1, pending: 1, attendance: 92, points: 300, rating: 4.1 },
    { userId: nadia.id, projectId: libraryProject.id, score: 89, completed: 1, late: 0, pending: 0, attendance: 96, points: 340, rating: 4.7 },
    { userId: bilal.id, projectId: eventPortalProject.id, score: 78, completed: 1, late: 0, pending: 1, attendance: 91, points: 280, rating: 4.0 },
  ];

  await prisma.performance.createMany({ data: performanceSeeds });

  console.log("Creating notifications...");

  await prisma.notification.createMany({
    data: [
      { userId: zaid.id, type: NotificationType.TASK, title: "New task assigned", body: 'You have been assigned to "Build face-recognition capture module".', read: false },
      { userId: omar.id, type: NotificationType.REVIEW, title: "Changes requested", body: 'Your submission for "Student self-check-in page" needs changes.', read: false },
      { userId: nadia.id, type: NotificationType.DEADLINE, title: "Deadline approaching", body: '"Email notification templates" is due in 3 days.', read: true },
      { userId: bilal.id, type: NotificationType.MENTION, title: "You were mentioned", body: "Sana Malik mentioned you in a comment on the RSVP API task.", read: false },
      { userId: ayesha.id, type: NotificationType.UPLOAD, title: "New attachment", body: "A new design file was uploaded to the attendance dashboard task.", read: true },
      { userId: faculty.id, type: NotificationType.REVIEW, title: "New submission for review", body: "Omar Farooq submitted a task for review.", read: false },
      { userId: sana.id, type: NotificationType.TASK, title: "Task status changed", body: '"Event creation form" was marked complete.', read: true },
      { userId: ta.id, type: NotificationType.REVIEW, title: "Pending reviews", body: "There are 2 submissions awaiting review.", read: false },
    ],
  });

  console.log("Seed complete.");
  console.log({
    users: 9,
    projects: 3,
    teams: 3,
    tasks: createdTasks.length,
    reviews: reviewTargets.length,
    performanceRecords: performanceSeeds.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
