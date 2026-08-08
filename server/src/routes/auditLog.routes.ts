import { Role } from "@prisma/client";
import { Router } from "express";
import * as miscController from "../controllers/misc.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole(Role.SUPER_ADMIN));
router.get("/", miscController.listAuditLogs);

export default router;
