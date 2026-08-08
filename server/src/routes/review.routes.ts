import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", reviewController.listReviews);
router.post("/", reviewController.createReview);
router.patch("/:id", reviewController.updateReview);

export default router;
