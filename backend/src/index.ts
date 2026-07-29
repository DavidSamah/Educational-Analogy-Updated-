import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { getDatabase, closeDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";
import { authRouter } from "./routes/auth.js";
import { conceptsRouter } from "./routes/concepts.js";
import { analogiesRouter } from "./routes/analogies.js";
import { graphRouter } from "./routes/graph.js";
import { practiceRouter } from "./routes/practice.js";
import { assessmentRouter } from "./routes/assessment.js";
import { recommendationsRouter } from "./routes/recommendations.js";
import { searchRouter } from "./routes/search.js";
import { progressRouter } from "./routes/progress.js";
import { settingsRouter } from "./routes/settings.js";
import { eventsRouter } from "./routes/events.js";

const app = express();

getDatabase();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/" + env.API_PREFIX, limiter);

app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use("/" + env.API_PREFIX + "/auth", authRouter);
app.use("/" + env.API_PREFIX + "/concepts", conceptsRouter);
app.use("/" + env.API_PREFIX + "/analogies", analogiesRouter);
app.use("/" + env.API_PREFIX + "/graph", graphRouter);
app.use("/" + env.API_PREFIX + "/practice", practiceRouter);
app.use("/" + env.API_PREFIX + "/assessment", assessmentRouter);
app.use("/" + env.API_PREFIX + "/recommendations", recommendationsRouter);
app.use("/" + env.API_PREFIX + "/search", searchRouter);
app.use("/" + env.API_PREFIX + "/progress", progressRouter);
app.use("/" + env.API_PREFIX + "/settings", settingsRouter);
app.use("/" + env.API_PREFIX + "/events", eventsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log("Analogy backend running on port " + env.PORT + " (" + env.NODE_ENV + ")");
});

process.on("SIGINT", () => {
  server.close(() => { closeDatabase(); process.exit(0); });
});

process.on("SIGTERM", () => {
  server.close(() => { closeDatabase(); process.exit(0); });
});
