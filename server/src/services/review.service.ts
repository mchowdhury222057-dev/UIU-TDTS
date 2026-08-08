import { Prisma, Role, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { canApproveTask, canReviewTask } from "./permissions";
import { CreateReviewInput, UpdateReviewInput } from "../validators/review.validator";
import { createNotification } from "./notification.service";

const reviewInclude = {
  task: { include: { project: true, team: true } },
  reviewer: true,
  submittedBy: true,
} satisfies Prisma.ReviewInclude;

export function reviewVisibilityWhere(user: User): Prisma.ReviewWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return {};
    case Role.FACULTY:
      return {
        task: { project: { OR: [{ supervisorId: user.id }, { createdById: user.id }] } },
      };
    case Role.TA:
      return {};
    case Role.LEADER:
      return { task: { team: { leaderId: user.id } } };
    case Role.STUDENT:
      return { submittedById: user.id };
    default:
      return { id: "__none__" };
  }
}

export async function listReviewsForUser(user: User) {
  return prisma.review.findMany({
    where: reviewVisibilityWhere(user),
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(user: User, input: CreateReviewInput) {
  const task = await prisma.task.findUnique({ where: { id: input.taskId }, include: { project: true } });
  if (!task) throw ApiError.badRequest("Selected task does not exist.");

  if (user.role === Role.STUDENT && input.submittedById !== user.id) {
    throw ApiError.forbidden("You can only submit your own work for review.");
  }

  const reviewerId = task.project.supervisorId;

  const review = await prisma.review.create({
    data: {
      taskId: input.taskId,
      submittedById: input.submittedById,
      reviewerId,
      status: "PENDING_REVIEW",
    },
    include: reviewInclude,
  });

  await createNotification(prisma, {
    userId: reviewerId,
    type: "REVIEW",
    title: "New submission for review",
    body: `${review.submittedBy.name} submitted "${task.title}" for review.`,
  });

  return review;
}

export async function updateReview(user: User, id: string, input: UpdateReviewInput) {
  const review = await prisma.review.findUnique({ where: { id }, include: reviewInclude });
  if (!review) throw ApiError.notFound("Review not found");

  const isApproval = input.status === "APPROVED" || input.status === "REJECTED";
  const allowed = isApproval ? canApproveTask(user) : canReviewTask(user);
  if (!allowed) throw ApiError.forbidden();

  const updated = await prisma.review.update({
    where: { id },
    data: { status: input.status, rating: input.rating, feedback: input.feedback },
    include: reviewInclude,
  });

  await createNotification(prisma, {
    userId: review.submittedById,
    type: "REVIEW",
    title: "Your submission was reviewed",
    body: `"${review.task.title}" was marked as ${input.status.replace("_", " ").toLowerCase()}.`,
  });

  return updated;
}
