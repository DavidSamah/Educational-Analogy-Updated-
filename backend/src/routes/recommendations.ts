import { Router } from "express";
import { RecommendationEngine } from "../services/recommendation/engine.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const recommendationEngine = new RecommendationEngine();

router.use(authMiddleware);

router.get("/user", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(await recommendationEngine.recommendForUser((req as any).user.userId, limit));
});

router.get("/concept/:conceptId", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 5;
  res.json(await recommendationEngine.recommendAnalogies(req.params.conceptId, limit));
});

router.get("/gaps", async (req, res) => {
  res.json(await recommendationEngine.findKnowledgeGaps((req as any).user.userId));
});

export { router as recommendationsRouter };
