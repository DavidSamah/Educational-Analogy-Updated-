import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { AnalogyRepository } from "../../repositories/AnalogyRepository.js";
import { RelationshipRepository } from "../../repositories/RelationshipRepository.js";
import { KnowledgeGraphEngine, type GraphNode } from "../graph/engine.js";
import { similarity, truncate } from "../../utils/formatters.js";

export interface SearchResult {
  type: "concept" | "analogy" | "relationship";
  id: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export class SearchEngine {
  private conceptRepo = new ConceptRepository();
  private analogyRepo = new AnalogyRepository();
  private relationshipRepo = new RelationshipRepository();
  private graphEngine = new KnowledgeGraphEngine();

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    const conceptResults = await this.conceptRepo.search(query, limit * 2);
    for (const concept of conceptResults.data) {
      const score = this.computeKeywordScore(queryLower, concept.title, concept.definition);
      results.push({
        type: "concept",
        id: concept.id,
        title: concept.title,
        snippet: truncate(concept.definition, 150),
        score,
        metadata: { difficulty: concept.difficulty, category: concept.category, domain: concept.domain },
      });
    }

    const conceptMatches = conceptResults.data.slice(0, 5);
    for (const concept of conceptMatches) {
      const neighbors = await this.graphEngine.getNeighbors(concept.id, "both");
      for (const neighbor of neighbors.slice(0, 3)) {
        const exists = results.find((r) => r.id === neighbor.id && r.type === "concept");
        if (!exists) {
          const rels = await this.relationshipRepo.findByConcept(concept.id);
          const rel = rels.find((r) => (r.sourceId === concept.id && r.targetId === neighbor.id) || (r.targetId === concept.id && r.sourceId === neighbor.id));
          results.push({
            type: "concept",
            id: neighbor.id,
            title: neighbor.label,
            snippet: `Related via ${rel?.type || "graph"}`,
            score: 0.5,
            metadata: { category: neighbor.category, difficulty: neighbor.difficulty },
          });
        }
      }
    }

    const allAnalogies = await this.analogyRepo.findByConcept(conceptMatches[0]?.id || "", limit * 2);
    for (const analogy of allAnalogies.data) {
      const score = this.computeKeywordScore(queryLower, analogy.content, analogy.explanation || "");
      if (score > 0.1) {
        results.push({
          type: "analogy",
          id: analogy.id,
          title: `Analogy for ${analogy.conceptId}`,
          snippet: truncate(analogy.content, 150),
          score: score * 0.8,
          metadata: { style: analogy.style, difficulty: analogy.difficulty, conceptId: analogy.conceptId },
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async searchSimilarConcepts(conceptId: string, limit = 10): Promise<SearchResult[]> {
    const graphEngine = new KnowledgeGraphEngine();
    const similarNodes = await graphEngine.findConceptsByType(conceptId, "similar_to");
    const concept = await this.conceptRepo.findById(conceptId);

    return similarNodes.slice(0, limit).map((node) => ({
      type: "concept" as const,
      id: node.id,
      title: node.label,
      snippet: "Similar concept",
      score: 0.8,
      metadata: { category: node.category, difficulty: node.difficulty },
    }));
  }

  private computeKeywordScore(query: string, ...texts: string[]): number {
    const combined = texts.join(" ").toLowerCase();
    const words = query.split(/\s+/).filter((w) => w.length > 2);

    if (words.length === 0) return 0;

    let matches = 0;
    for (const word of words) {
      if (combined.includes(word)) matches++;
    }

    return matches / words.length;
  }
}
