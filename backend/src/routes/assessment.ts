import { Router } from "express";
import { AssessmentEngine } from "../services/assessment/engine.js";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();
const assessmentEngine = new AssessmentEngine();

router.use(authMiddleware);

const AssessmentSchema = z.object({
  conceptId: z.string(),
  userAnswer: z.string().min(1),
});

router.post("/submit", validate(AssessmentSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { conceptId, userAnswer } = req.body;
    const result = await assessmentEngine.assessSubmission((req as any).user.userId, conceptId, userAnswer);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/progress", async (req: AuthenticatedRequest, res) => {
  res.json(await assessmentEngine.getProgressSummary((req as any).user.userId, req.query.conceptId as string | undefined));
});

export { router as assessmentRouter };
