import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as reviewService from "../services/review.service";
import { createReviewSchema, updateReviewSchema } from "../validators/review.validator";

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const reviews = await reviewService.listReviewsForUser(req.user);
  res.json({ success: true, data: reviews });
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.user, input);
  res.status(201).json({ success: true, data: review });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateReviewSchema.parse(req.body);
  const review = await reviewService.updateReview(req.user, req.params.id, input);
  res.json({ success: true, data: review });
});
