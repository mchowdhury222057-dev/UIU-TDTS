import { Role, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/jwt";

const TOKEN_COOKIE = "uiu_tdts_token";
export const AUTH_COOKIE_NAME = TOKEN_COOKIE;

// Populates req.user from the auth cookie if present, but does not reject the request.
export const attachUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user) req.user = user;
  } catch {
    // Invalid/expired token: treat as unauthenticated rather than erroring.
  }
  next();
});

// Rejects the request unless a valid authenticated user is attached.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  next();
}

// Rejects the request unless req.user's role is one of the allowed roles.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}

// Rejects the request unless the given predicate (a centralized permission
// helper from services/permissions.ts) returns true for req.user.
export function requirePermission(predicate: (user: User) => boolean) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!predicate(req.user)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
