import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole(Role.SUPER_ADMIN, Role.FACULTY, Role.TA), userController.listUsers);
router.get("/:id", userController.getUser);
router.patch("/:id", userController.updateProfile);
router.patch("/:id/password", userController.updatePassword);
router.patch("/:id/role", requireRole(Role.SUPER_ADMIN), userController.updateRole);
router.delete("/:id", requireRole(Role.SUPER_ADMIN), userController.deleteUser);

export default router;
