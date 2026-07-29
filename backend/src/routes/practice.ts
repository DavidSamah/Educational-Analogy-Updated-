import { Router } from "express";
import { PracticeEngine } from "../services/practice/engine.js";
import { PracticeRepository } from "../repositories/PracticeRepository.js";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();
const practiceEngine = new PracticeEngine();
const practiceRepo = new PracticeRepository();

router.use(authMiddleware);

const PracticeModes = ["create_analogy", "matching", "reflection", "misconception_check"] as const;

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(await practiceRepo.findByUser((req as any).user?.userId, limit, offset));
});

router.get("/concept/:conceptId", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(await practiceRepo.findByConcept(req.params.conceptId, limit, offset));
});

router.get("/:id", async (req, res) => {
  const attempt = await practiceRepo.findById(req.params.id);
  if (!attempt) return res.status(404).json({ error: "Practice attempt not found" });
  res.json(attempt);
});

router.post("/challenge", (req: AuthenticatedRequest, res) => {
  const { conceptId, mode } = req.body;
  if (!conceptId || !mode) return res.status(400).json({ error: "conceptId and mode are required" });
  res.json(practiceEngine.generateChallenge(conceptId, mode));
});

const SubmitPracticeSchema = z.object({
  conceptId: z.string(),
  mode: z.enum(PracticeModes),
  userAnswer: z.string().min(1),
});

router.post("/submit", validate(SubmitPracticeSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { conceptId, mode, userAnswer } = req.body;
    const attempt = await practiceEngine.evaluateSubmission((req as any).user.userId, conceptId, mode, userAnswer);
    res.status(201).json(attempt);
  } catch (err) {
    next(err);
  }
});

export { router as practiceRouter };
