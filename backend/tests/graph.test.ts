import { describe, it, expect, beforeEach } from "vitest";
import { KnowledgeGraphEngine } from "../src/services/graph/engine.js";
import { ConceptRepository } from "../src/repositories/ConceptRepository.js";
import { RelationshipRepository } from "../src/repositories/RelationshipRepository.js";

describe("KnowledgeGraphEngine", () => {
  let graphEngine: KnowledgeGraphEngine;
  let conceptRepo: ConceptRepository;
  let relRepo: RelationshipRepository;

  beforeEach(async () => {
    graphEngine = new KnowledgeGraphEngine();
    conceptRepo = new ConceptRepository();
    relRepo = new RelationshipRepository();
  });

  it("should find neighbors of a concept", async () => {
    const concept = await conceptRepo.create({
      title: "Test Concept",
      definition: "A test concept",
      difficulty: "intermediate",
    });

    const neighbor1 = await conceptRepo.create({
      title: "Neighbor 1",
      definition: "First neighbor",
      difficulty: "beginner",
    });

    const neighbor2 = await conceptRepo.create({
      title: "Neighbor 2",
      definition: "Second neighbor",
      difficulty: "beginner",
    });

    await relRepo.create({
      sourceId: concept.id,
      targetId: neighbor1.id,
      type: "requires",
      confidence: 1.0,
      weight: 1.0,
    });

    await relRepo.create({
      sourceId: concept.id,
      targetId: neighbor2.id,
      type: "similar_to",
      confidence: 0.8,
      weight: 1.0,
    });

    const neighbors = await graphEngine.getNeighbors(concept.id);
    expect(neighbors).toHaveLength(2);
    expect(neighbors.map((n) => n.id).sort()).toEqual([neighbor1.id, neighbor2.id].sort());
  });

  it("should find prerequisites up to max depth", async () => {
    const concept = await conceptRepo.create({
      title: "Advanced Concept",
      definition: "An advanced concept",
      difficulty: "advanced",
    });

    const prereq = await conceptRepo.create({
      title: "Prerequisite",
      definition: "A prerequisite",
      difficulty: "beginner",
    });

    const prereq2 = await conceptRepo.create({
      title: "Deep Prerequisite",
      definition: "A deep prerequisite",
      difficulty: "beginner",
    });

    await relRepo.create({
      sourceId: concept.id,
      targetId: prereq.id,
      type: "requires",
      confidence: 1.0,
      weight: 1.0,
    });

    await relRepo.create({
      sourceId: prereq.id,
      targetId: prereq2.id,
      type: "requires",
      confidence: 1.0,
      weight: 1.0,
    });

    const prerequisites = await graphEngine.findPrerequisites(concept.id, 2);
    expect(prerequisites).toContain(prereq.id);
    expect(prerequisites).toContain(prereq2.id);
  });

  it("should return empty for concept with no relationships", async () => {
    const concept = await conceptRepo.create({
      title: "Isolated Concept",
      definition: "An isolated concept",
      difficulty: "beginner",
    });

    const neighbors = await graphEngine.getNeighbors(concept.id);
    expect(neighbors).toHaveLength(0);
  });
});
