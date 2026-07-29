import { ConceptRepository } from "../../repositories/ConceptRepository.js";
import { z } from "zod";
import { NotFoundError } from "../../utils/errors.js";

const CreateConceptSchema = z.object({
  title: z.string().min(1),
  definition: z.string().min(1),
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  domain: z.string().optional(),
  createdBy: z.string().optional(),
});

const UpdateConceptSchema = CreateConceptSchema.partial();

export class ConceptService {
  private repo = new ConceptRepository();

  create(data: unknown) {
    const parsed = CreateConceptSchema.parse(data);
    return this.repo.create(parsed);
  }

  findById(id: string) {
    const concept = this.repo.findById(id);
    if (!concept) throw new NotFoundError("Concept not found");
    return concept;
  }

  search(query: string, limit = 20, offset = 0) {
    return this.repo.search(query, limit, offset);
  }

  findAll(limit = 50, offset = 0) {
    return this.repo.findAll(limit, offset);
  }

  update(id: string, data: unknown) {
    const parsed = UpdateConceptSchema.parse(data);
    const concept = this.repo.update(id, parsed);
    if (!concept) throw new NotFoundError("Concept not found");
    return concept;
  }

  delete(id: string) {
    const deleted = this.repo.delete(id);
    if (!deleted) throw new NotFoundError("Concept not found");
    return { success: true };
  }
}
