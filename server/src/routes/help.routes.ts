import { Router } from "express";
import * as helpController from "../controllers/help.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { canManageHelp } from "../services/permissions";

const router = Router();

router.use(requireAuth);

router.get("/", helpController.listHelpArticles);
router.post("/", requirePermission(canManageHelp), helpController.createHelpArticle);
router.patch("/:id", requirePermission(canManageHelp), helpController.updateHelpArticle);
router.delete("/:id", requirePermission(canManageHelp), helpController.deleteHelpArticle);

export default router;
