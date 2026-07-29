import { Router } from "express";
import { AuthService } from "../services/auth/AuthService.js";

const router = Router();
const authService = new AuthService();

router.post("/register", async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Refresh token is required" });
    const tokens = authService.refreshToken(token);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

router.get("/me", (req, res) => {
  res.json({ user: (req as any).user });
});

export { router as authRouter };
