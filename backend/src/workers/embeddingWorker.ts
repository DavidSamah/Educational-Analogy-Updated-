import { ConceptRepository } from "../repositories/ConceptRepository.js";
import { logger } from "../utils/logger.js";
export class EmbeddingWorker { private conceptRepo = new ConceptRepository(); async queueConceptEmbedding(conceptId: string): Promise<void> { const concept = this.conceptRepo.findById(conceptId); if (!concept) return; logger.info("Embedding queued", { conceptId, title: concept.title }); } async processQueue(): Promise<void> { logger.debug("Embedding worker tick (no jobs)"); } }
