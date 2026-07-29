import { describe, it, expect, beforeEach } from "vitest";
import { SearchEngine } from "../src/services/search/engine.js";
import { ConceptRepository } from "../src/repositories/ConceptRepository.js";

describe("SearchEngine", () => {
  let searchEngine: SearchEngine;
  let conceptRepo: ConceptRepository;

  beforeEach(async () => {
    searchEngine = new SearchEngine();
    conceptRepo = new ConceptRepository();

    await conceptRepo.create({
      title: "Gravity",
      definition: "A force that attracts objects with mass.",
      category: "Physics",
      difficulty: "intermediate",
    });

    await conceptRepo.create({
      title: "Newton's Laws",
      definition: "Three laws describing motion.",
      category: "Physics",
      difficulty: "intermediate",
    });

    await conceptRepo.create({
      title: "Photosynthesis",
      definition: "Process by which plants convert light into energy.",
      category: "Biology",
      difficulty: "beginner",
    });
  });

  it("should search concepts by keyword", async () => {
    const results = await searchEngine.search("gravity");
    expect(results.some((r) => r.type === "concept" && r.title === "Gravity")).toBe(true);
  });

  it("should search concepts by category", async () => {
    const results = await searchEngine.search("Physics");
    expect(results.length).toBeGreaterThan(0);
  });

  it("should return empty array for no matches", async () => {
    const results = await searchEngine.search("nonexistent xyz");
    expect(results).toHaveLength(0);
  });

  it("should return results sorted by score", async () => {
    const results = await searchEngine.search("force");
    expect(results.length).toBeGreaterThan(0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
