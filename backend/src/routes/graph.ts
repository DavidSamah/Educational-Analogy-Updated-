import { Router } from "express";
import { KnowledgeGraphEngine } from "../services/graph/engine.js";
import { RelationshipRepository } from "../repositories/RelationshipRepository.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();
const graphEngine = new KnowledgeGraphEngine();
const relationshipRepo = new RelationshipRepository();

router.use(authMiddleware);

router.get("/neighbors/:conceptId", async (req, res) => {
  const direction = (req.query.direction as string) || "both";
  res.json(await graphEngine.getNeighbors(req.params.conceptId, direction as any));
});

router.get("/relationships/:conceptId", async (req, res) => {
  res.json(await graphEngine.getRelationships(req.params.conceptId));
});

router.get("/bfs/:conceptId", async (req, res) => {
  const maxDepth = parseInt(req.query.maxDepth as string) || 3;
  res.json(await graphEngine.bfs(req.params.conceptId, maxDepth));
});

router.get("/dfs/:conceptId", async (req, res) => {
  const maxDepth = parseInt(req.query.maxDepth as string) || 3;
  res.json(await graphEngine.dfs(req.params.conceptId, maxDepth));
});

router.get("/path", async (req, res) => {
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (!from || !to) return res.status(400).json({ error: "from and to query params are required" });
  res.json(await graphEngine.shortestPath(from, to));
});

router.get("/rank/:conceptId", async (req, res) => {
  const type = req.query.type as string | undefined;
  res.json(await graphEngine.rankRelationships(req.params.conceptId, type));
});

router.get("/prerequisites/:conceptId", async (req, res) => {
  const maxDepth = parseInt(req.query.maxDepth as string) || 2;
  res.json({ prerequisites: await graphEngine.findPrerequisites(req.params.conceptId, maxDepth) });
});

const CreateRelationshipSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["is_a", "part_of", "requires", "causes", "depends_on", "similar_to", "opposite_of", "analogy_of", "used_in", "derived_from"]),
  confidence: z.number().min(0).max(1).default(1.0),
  source: z.string().optional(),
  weight: z.number().min(0).default(1.0),
});

router.post("/relationships", validate(CreateRelationshipSchema), async (req, res) => {
  res.status(201).json(await relationshipRepo.create(req.body));
});

router.delete("/relationships/:id", async (req, res) => {
  const deleted = await relationshipRepo.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Relationship not found" });
  res.status(204).send();
});

export { router as graphRouter };
