import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal server error";

  console.error("[" + new Date().toISOString() + "] " + req.method + " " + req.path, err instanceof AppError ? err.message : err);

  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    res.status(statusCode).json({ error: message, stack: err.stack });
  } else {
    res.status(statusCode).json({ error: message });
  }
}
