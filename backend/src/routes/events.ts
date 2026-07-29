import { Router } from "express";
import { eventEmitter, DomainEvents } from "../events/emitter.js";

const router = Router();

router.get("/types", (_req, res) => {
  res.json(Object.values(DomainEvents));
});

router.post("/emit", (req, res) => {
  const { eventName, data } = req.body;
  if (!eventName) return res.status(400).json({ error: "eventName is required" });
  eventEmitter.emit(eventName, data || {});
  res.status(202).json({ received: true, eventName });
});

export { router as eventsRouter };
