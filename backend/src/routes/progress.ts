import { Router } from "express";
import { LearningPathEngine } from "../services/learning/pathEngine.js";
import { AnalyticsService } from "../services/analytics/service.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const learningPathEngine = new LearningPathEngine();
const analyticsService = new AnalyticsService();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  res.json(await analyticsService.getUserStats((req as any).user.userId));
});

router.get("/concept/:conceptId", async (req, res) => {
  res.json(await analyticsService.getConceptStats((req as any).user.userId, req.params.conceptId));
});

router.post("/path", async (req, res) => {
  const userId = (req as any).user.userId;
  const { goalConceptId } = req.body;
  if (!goalConceptId) return res.status(400).json({ error: "goalConceptId is required" });
  res.status(201).json(await learningPathEngine.buildAdaptivePath(userId, goalConceptId));
});

router.get("/profile", async (req, res) => {
  res.json(await learningPathEngine.buildLearnerProfile((req as any).user.userId));
});

router.get("/next-topic", async (req, res) => {
  const next = await learningPathEngine.getNextTopic((req as any).user.userId);
  res.json(next);
});

router.get("/estimate/:conceptId", async (req, res) => {
  res.json(await learningPathEngine.estimateMasteryTime((req as any).user.userId, req.params.conceptId));
});

export { router as progressRouter };
