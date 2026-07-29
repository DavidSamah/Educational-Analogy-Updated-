import { Router } from "express";
import { SearchEngine } from "../services/search/engine.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const searchEngine = new SearchEngine();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Query parameter q is required" });
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(await searchEngine.search(query, limit));
});

router.get("/similar/:conceptId", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(await searchEngine.searchSimilarConcepts(req.params.conceptId, limit));
});

export { router as searchRouter };
