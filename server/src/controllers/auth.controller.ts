import { Request, Response } from "express";
import { env } from "../config/env";
import { AUTH_COOKIE_NAME } from "../middleware/auth";
import * as authService from "../services/auth.service";
import { sanitizeUser } from "../utils/user";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { ApiError } from "../utils/ApiError";

const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const user = await authService.login(input);
  const token = signToken({ userId: user.id });
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
  res.json({ success: true, data: sanitizeUser(user) });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const user = await authService.register(input);
  const token = signToken({ userId: user.id });
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
  res.status(201).json({ success: true, data: sanitizeUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  res.json({ success: true, data: null });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: sanitizeUser(req.user) });
});
