import { Router } from "express";
import { AnalogyEngine } from "../services/analogy/AnalogyEngine.js";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const analogyEngine = new AnalogyEngine();

router.use(authMiddleware);

router.get("/:id", async (req, res) => {
  res.json(await analogyEngine.findById(req.params.id));
});

router.get("/concept/:conceptId", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  res.json(await analogyEngine.findByConcept(req.params.conceptId, limit, offset));
});

router.post("/generate", async (req: AuthenticatedRequest, res, next) => {
  try {
    const analogy = await analogyEngine.generate({ ...req.body, userId: (req as any).user?.userId });
    res.status(201).json(analogy);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/regenerate", async (req, res, next) => {
  try {
    res.json(await analogyEngine.regenerate(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post("/:id/simplify", async (req, res, next) => {
  try {
    res.json(await analogyEngine.simplify(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post("/:id/expand", async (req, res, next) => {
  try {
    res.json(await analogyEngine.expand(req.params.id));
  } catch (err) {
    next(err);
  }
});

export { router as analogiesRouter };
