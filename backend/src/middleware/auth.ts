import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth/TokenService.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UnauthorizedError } from "../utils/errors.js";

const userRepo = new UserRepository();

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid Authorization header"));
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(new UnauthorizedError("Invalid or expired token"));
  }

  const user = userRepo.findById(payload.userId);
  if (!user) {
    return next(new UnauthorizedError("User not found"));
  }

  req.user = { userId: user.id, email: user.email, role: user.role };
  next();
}

export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return next(new (require("../utils/errors.js")).ForbiddenError("Admin access required"));
  }
  next();
}
