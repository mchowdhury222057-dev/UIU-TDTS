import { Router } from "express";
import * as teamController from "../controllers/team.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { canCreateTeam } from "../services/permissions";

const router = Router();

router.use(requireAuth);

router.get("/", teamController.listTeams);
router.post("/", requirePermission(canCreateTeam), teamController.createTeam);
router.get("/:id", teamController.getTeam);
router.patch("/:id", teamController.updateTeam);
router.delete("/:id", teamController.deleteTeam);

export default router;
