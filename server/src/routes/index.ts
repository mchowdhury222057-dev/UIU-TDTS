import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import projectRoutes from "./project.routes";
import teamRoutes from "./team.routes";
import taskRoutes from "./task.routes";
import reviewRoutes from "./review.routes";
import notificationRoutes from "./notification.routes";
import performanceRoutes from "./performance.routes";
import reportRoutes from "./report.routes";
import dashboardRoutes from "./dashboard.routes";
import auditLogRoutes from "./auditLog.routes";
import permissionRoutes from "./permission.routes";
import helpRoutes from "./help.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/teams", teamRoutes);
router.use("/tasks", taskRoutes);
router.use("/reviews", reviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/performance", performanceRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/permissions", permissionRoutes);
router.use("/help", helpRoutes);

export default router;
