import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", taskController.listTasks);
router.post("/", taskController.createTask);
router.get("/:id", taskController.getTask);
router.patch("/:id", taskController.updateTask);
router.patch("/:id/status", taskController.updateTaskStatus);
router.delete("/:id", taskController.deleteTask);
router.post("/:id/comments", taskController.addComment);

export default router;
