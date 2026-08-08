import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" });
}

// Centralized error handler: never leak stack traces or raw DB errors to the client.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(", ");
    return res.status(400).json({ success: false, message: message || "Invalid input" });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A record with this value already exists." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ success: false, message: "This action conflicts with related records." });
    }
  }

  if (!env.isProduction) {
    console.error(err);
  }

  return res.status(500).json({ success: false, message: "Internal server error" });
}
