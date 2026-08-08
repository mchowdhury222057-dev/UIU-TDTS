import { Router } from "express";
import * as miscController from "../controllers/misc.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", miscController.getDashboard);

export default router;
