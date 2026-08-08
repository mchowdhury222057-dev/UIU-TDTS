import type { Review, ReviewStatus } from "../types";
import { api } from "./client";

export interface CreateReviewPayload {
  taskId: string;
  submittedById: string;
}

export interface UpdateReviewPayload {
  status: ReviewStatus;
  rating?: number;
  feedback?: string;
}

export const reviewsApi = {
  list: () => api.get<Review[]>("/reviews"),
  create: (payload: CreateReviewPayload) => api.post<Review>("/reviews", payload),
  update: (id: string, payload: UpdateReviewPayload) => api.patch<Review>(`/reviews/${id}`, payload),
};
