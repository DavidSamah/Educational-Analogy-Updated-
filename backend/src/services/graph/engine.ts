import type { Relationship, Concept } from "../../models/index.js";
import { RelationshipRepository, ConceptRepository } from "../../repositories/index.js";

export interface GraphNode {
  id: string;
  label: string;
  category?: string;
  difficulty?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  confidence: number;
}

export interface GraphPath {
  nodes: string[];
  edges: GraphEdge[];
  totalWeight: number;
}

export interface Subgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class KnowledgeGraphEngine {
  private relationshipRepo = new RelationshipRepository();
  private conceptRepo = new ConceptRepository();

  async getNeighbors(conceptId: string, direction: "outgoing" | "incoming" | "both" = "both"): Promise<GraphNode[]> {
    const relationships = await this.relationshipRepo.findByConcept(conceptId);
    const neighborIds = new Set<string>();

    for (const rel of relationships) {
      if ((direction === "outgoing" || direction === "both") && rel.sourceId === conceptId) {
        neighborIds.add(rel.targetId);
      }
      if ((direction === "incoming" || direction === "both") && rel.targetId === conceptId) {
        neighborIds.add(rel.sourceId);
      }
    }

    const neighbors = await Promise.all(
      Array.from(neighborIds).map(async (id) => await this.conceptRepo.findById(id))
    );

    return neighbors
      .filter((c): c is Concept => c !== undefined)
      .map((c) => ({ id: c.id, label: c.title, category: c.category, difficulty: c.difficulty }));
  }

  async getRelationships(conceptId: string): Promise<GraphEdge[]> {
    const relationships = await this.relationshipRepo.findByConcept(conceptId);
    return relationships.map((rel) => ({
      source: rel.sourceId,
      target: rel.targetId,
      type: rel.type,
      weight: rel.weight,
      confidence: rel.confidence,
    }));
  }

  async bfs(startId: string, maxDepth = 3): Promise<Subgraph> {
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const concept = await this.conceptRepo.findById(current.id);
      if (concept) {
        nodes.push({ id: concept.id, label: concept.title, category: concept.category, difficulty: concept.difficulty });
      }

      if (current.depth >= maxDepth) continue;

      const rels = await this.relationshipRepo.findByConcept(current.id);

      for (const rel of rels) {
        const neighborId = rel.sourceId === current.id ? rel.targetId : rel.sourceId;
        const sortedIds = [current.id, neighborId].sort();
        const edgeKey = `${sortedIds[0]}-${sortedIds[1]}-${rel.type}`;

        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({
            source: rel.sourceId,
            target: rel.targetId,
            type: rel.type,
            weight: rel.weight,
            confidence: rel.confidence,
          });
        }

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, depth: current.depth + 1 });
        }
      }
    }

    return { nodes, edges };
  }

  async dfs(startId: string, maxDepth = 3): Promise<Subgraph> {
    const visited = new Set<string>();
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    const visit = async (id: string, depth: number) => {
      if (visited.has(id) || depth > maxDepth) return;
      visited.add(id);

      const concept = await this.conceptRepo.findById(id);
      if (concept) {
        nodes.push({ id: concept.id, label: concept.title, category: concept.category, difficulty: concept.difficulty });
      }

      const rels = await this.relationshipRepo.findByConcept(id);
      for (const rel of rels) {
        const neighborId = rel.sourceId === id ? rel.targetId : rel.sourceId;
        const sortedIds = [id, neighborId].sort();
        const edgeKey = `${sortedIds[0]}-${sortedIds[1]}-${rel.type}`;

        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({
            source: rel.sourceId,
            target: rel.targetId,
            type: rel.type,
            weight: rel.weight,
            confidence: rel.confidence,
          });
        }

        await visit(neighborId, depth + 1);
      }
    };

    await visit(startId, 0);
    return { nodes, edges };
  }

  async shortestPath(fromId: string, toId: string): Promise<GraphPath | null> {
    const queue: { id: string; path: string[]; edges: GraphEdge[] }[] = [
      { id: fromId, path: [fromId], edges: [] },
    ];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.id === toId) {
        return {
          nodes: current.path,
          edges: current.edges,
          totalWeight: current.edges.reduce((sum, e) => sum + e.weight, 0),
        };
      }

      const rels = await this.relationshipRepo.findByConcept(current.id);
      for (const rel of rels) {
        const neighborId = rel.sourceId === current.id ? rel.targetId : rel.sourceId;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({
            id: neighborId,
            path: [...current.path, neighborId],
            edges: [
              ...current.edges,
              {
                source: rel.sourceId,
                target: rel.targetId,
                type: rel.type,
                weight: rel.weight,
                confidence: rel.confidence,
              },
            ],
          });
        }
      }
    }

    return null;
  }

  async rankRelationships(conceptId: string, type?: string): Promise<GraphEdge[]> {
    const edges = await this.getRelationships(conceptId);
    return edges
      .filter((e) => !type || e.type === type)
      .sort((a, b) => (b.confidence * b.weight) - (a.confidence * a.weight));
  }

  async findConceptsByType(conceptId: string, relationshipType: string): Promise<GraphNode[]> {
    const rels = await this.relationshipRepo.findByConcept(conceptId);
    const targetIds = rels
      .filter((r) => r.type === relationshipType && r.sourceId === conceptId)
      .map((r) => r.targetId);

    const concepts = await Promise.all(
      targetIds.map((id) => this.conceptRepo.findById(id))
    );

    return concepts
      .filter((c): c is Concept => c !== undefined)
      .map((c) => ({ id: c.id, label: c.title, category: c.category, difficulty: c.difficulty }));
  }

  async findPrerequisites(conceptId: string, maxDepth = 2): Promise<string[]> {
    const visited = new Set<string>();
    const prerequisites: string[] = [];
    const queue: { id: string; depth: number }[] = [{ id: conceptId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= maxDepth) continue;

      const requires = await this.findConceptsByType(current.id, "requires");
      for (const req of requires) {
        if (!visited.has(req.id)) {
          visited.add(req.id);
          prerequisites.push(req.id);
          queue.push({ id: req.id, depth: current.depth + 1 });
        }
      }
    }

    return prerequisites;
  }
}
