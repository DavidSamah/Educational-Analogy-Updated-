import { eventEmitter, DomainEvents } from "../events/emitter.js";
import { logger } from "../utils/logger.js";
export class AnalyticsWorker { initialize() { eventEmitter.on(DomainEvents.PracticeCompleted, (data: any) => { logger.info("Analytics: practice completed", { userId: data.userId, score: data.score }); }); eventEmitter.on(DomainEvents.ConceptCreated, (data: any) => { logger.info("Analytics: concept created", { conceptId: data.conceptId }); }); } }
export const analyticsWorker = new AnalyticsWorker();
