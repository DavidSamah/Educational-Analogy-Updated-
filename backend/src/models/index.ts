export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "student" | "teacher" | "admin";
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Concept {
  id: string;
  title: string;
  definition: string;
  category?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  domain?: string;
  createdBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: "is_a" | "part_of" | "requires" | "causes" | "depends_on" | "similar_to" | "opposite_of" | "analogy_of" | "used_in" | "derived_from";
  confidence: number;
  source?: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analogy {
  id: string;
  conceptId: string;
  userId?: string;
  content: string;
  style: string;
  difficulty: string;
  perspective?: string;
  mapping: string[];
  explanation?: string;
  limitations?: string;
  misconceptions: string[];
  confidenceScore: number;
  createdAt: string;
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  mode: string;
  conceptId?: string;
  userAnswer: string;
  feedback: Record<string, unknown>;
  score: number;
  strengths: string[];
  weaknesses: string[];
  misconceptions: string[];
  suggestions: string[];
  createdAt: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  stages: LearningStage[];
  currentStage: number;
  completedConcepts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningStage {
  key: string;
  label: string;
  description: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

export interface KnowledgeMap {
  id: string;
  userId: string;
  name: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  category?: string;
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  userId: string;
  conceptId?: string;
  duration: number;
  activities: string[];
  createdAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
