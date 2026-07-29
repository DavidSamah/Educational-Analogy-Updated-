import { Router } from "express";
import { ConceptService } from "../services/concept/ConceptService.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();
const conceptService = new ConceptService();

router.use(authMiddleware);

const CreateConceptSchema = z.object({
  title: z.string().min(1),
  definition: z.string().min(1),
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  domain: z.string().optional(),
  createdBy: z.string().optional(),
});

const UpdateConceptSchema = CreateConceptSchema.partial();

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(await conceptService.findAll(limit, offset));
});

router.get("/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Query parameter q is required" });
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(await conceptService.search(query, limit, offset));
});

router.get("/:id", async (req, res) => {
  res.json(await conceptService.findById(req.params.id));
});

router.post("/", validate(CreateConceptSchema), async (req, res) => {
  res.status(201).json(await conceptService.create(req.body));
});

router.patch("/:id", validate(UpdateConceptSchema), async (req, res) => {
  res.json(await conceptService.update(req.params.id, req.body));
});

router.delete("/:id", async (req, res) => {
  await conceptService.delete(req.params.id);
  res.status(204).send();
});

export { router as conceptsRouter };
