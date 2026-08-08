import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { canCreateProject } from "../services/permissions";

const router = Router();

router.use(requireAuth);

router.get("/", projectController.listProjects);
router.post("/", requirePermission(canCreateProject), projectController.createProject);
router.get("/:id", projectController.getProject);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export default router;
