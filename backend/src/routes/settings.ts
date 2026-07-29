import { Router } from "express";
import { UserRepository } from "../repositories/UserRepository.js";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();
const userRepo = new UserRepository();

router.use(authMiddleware);

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

router.get("/", async (req, res) => {
  const user = await userRepo.findById((req as any).user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash: _, ...safe } = user as any;
  res.json(safe);
});

router.patch("/", validate(UpdateProfileSchema), async (req, res) => {
  const updated = await userRepo.update((req as any).user.userId, req.body);
  if (!updated) return res.status(404).json({ error: "User not found" });
  const { passwordHash: _, ...safe } = updated as any;
  res.json(safe);
});

export { router as settingsRouter };
