import { Router } from "express";
import * as sprintController from "../controllers/sprint.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { canCreateSprint } from "../services/permissions";

const router = Router();

router.use(requireAuth);

router.get("/", sprintController.listSprints);
router.post("/", requirePermission(canCreateSprint), sprintController.createSprint);
router.get("/:id", sprintController.getSprint);
router.patch("/:id", sprintController.updateSprint);
router.delete("/:id", sprintController.deleteSprint);

export default router;
