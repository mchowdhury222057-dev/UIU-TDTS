import { Prisma, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { canManageHelp } from "./permissions";
import { CreateHelpArticleInput, UpdateHelpArticleInput } from "../validators/help.validator";
import { writeAuditLog } from "./audit.service";

const helpArticleInclude = {
  createdBy: true,
} satisfies Prisma.HelpArticleInclude;

export async function listHelpArticles() {
  return prisma.helpArticle.findMany({
    include: helpArticleInclude,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function createHelpArticle(user: User, input: CreateHelpArticleInput) {
  if (!canManageHelp(user)) throw ApiError.forbidden();

  return prisma.$transaction(async (tx) => {
    const maxOrder = await tx.helpArticle.aggregate({ _max: { order: true } });
    const article = await tx.helpArticle.create({
      data: {
        question: input.question,
        answer: input.answer,
        order: (maxOrder._max.order ?? -1) + 1,
        createdById: user.id,
      },
      include: helpArticleInclude,
    });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "HELP_ARTICLE_CREATE",
      targetType: "HelpArticle",
      targetId: article.id,
      details: { question: article.question },
    });
    return article;
  });
}

export async function updateHelpArticle(user: User, id: string, input: UpdateHelpArticleInput) {
  if (!canManageHelp(user)) throw ApiError.forbidden();

  const existing = await prisma.helpArticle.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Help article not found");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.helpArticle.update({
      where: { id },
      data: {
        question: input.question,
        answer: input.answer,
        order: input.order,
      },
      include: helpArticleInclude,
    });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "HELP_ARTICLE_UPDATE",
      targetType: "HelpArticle",
      targetId: id,
      details: { question: updated.question },
    });
    return updated;
  });
}

export async function deleteHelpArticle(user: User, id: string) {
  if (!canManageHelp(user)) throw ApiError.forbidden();

  const existing = await prisma.helpArticle.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Help article not found");

  return prisma.$transaction(async (tx) => {
    await tx.helpArticle.delete({ where: { id } });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "HELP_ARTICLE_DELETE",
      targetType: "HelpArticle",
      targetId: id,
      details: { question: existing.question },
    });
  });
}
