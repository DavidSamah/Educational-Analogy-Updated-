# Analogy Educational Platform — Backend Implementation Plan

## 1. Existing Architecture (Discovered)

### Current State
- **Frontend:** React 19 + Vite 8 (no backend exists)
- **AI Integration:** Client-side OpenRouter API call in `src/api/analogyApi.js`
- **Knowledge Graph:** In-memory JS object in `src/knowledge/graph.js` (single Gravity concept)
- **Engines:** `pathFinder`, `lessonBuilder`, `knowledgeEngine`, `graphTraversal` — all client-side
- **Orchestrator:** `learningOrchestrator.js` — client-side
- **Database:** None
- **Authentication:** None
- **State:** Local React state only

### What Must Be Preserved
- Frontend routing, UI components, and pages must remain functional
- Existing OpenRouter API key in `.env` must continue working
- `src/api/analogyApi.js` contract should be mirrored/extended by backend
- Knowledge graph data structure should be migrated to backend persistence
- Engine logic (`pathFinder`, `lessonBuilder`, etc.) should be reimplemented as backend services

## 2. Backend Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js + Express | Standard, minimal, already in ecosystem |
| Language | TypeScript | Type safety for complex educational models |
| Database | SQLite (better-sqlite3) | Zero-config, embedded, perfect for standalone app |
| Auth | JWT + bcrypt | Standard, stateless, works without external services |
| Validation | Zod | TypeScript-native, expressive |
| AI Integration | OpenRouter SDK / fetch | Reuse existing API key, add orchestration |
| Testing | Vitest | Fast, same ecosystem as frontend |

## 3. Project Structure

```
backend/
  src/
    config/
      database.ts
      env.ts
    models/
      User.ts
      Concept.ts
      Relationship.ts
      Analogy.ts
      PracticeAttempt.ts
      LearningPath.ts
      KnowledgeMap.ts
      Bookmark.ts
      LearningSession.ts
    repositories/
      UserRepository.ts
      ConceptRepository.ts
      RelationshipRepository.ts
      AnalogyRepository.ts
      PracticeRepository.ts
      LearningPathRepository.ts
      KnowledgeMapRepository.ts
      BookmarkRepository.ts
      SessionRepository.ts
    services/
      auth/
        AuthService.ts
        PasswordService.ts
        TokenService.ts
      concept/
        ConceptService.ts
      analogy/
        AnalogyEngine.ts
        AnalogyOrchestrator.ts
      graph/
        KnowledgeGraphEngine.ts
        GraphTraversal.ts
        RelationshipService.ts
      learning/
        LearningPathEngine.ts
        RecommendationEngine.ts
      practice/
        PracticeEngine.ts
        AssessmentEngine.ts
      search/
        SearchService.ts
        SemanticSearch.ts
      analytics/
        AnalyticsService.ts
      prompts/
        PromptManager.ts
        prompts/
          generateAnalogy.ts
          evaluateAnalogy.ts
          detectMisconceptions.ts
          recommendNextTopic.ts
    routes/
      auth.ts
      users.ts
      concepts.ts
      analogies.ts
      knowledge-graph.ts
      learning-paths.ts
      practice.ts
      assessment.ts
      recommendations.ts
      search.ts
      progress.ts
      settings.ts
    middleware/
      auth.ts
      validate.ts
      rateLimit.ts
      errorHandler.ts
      cors.ts
    workers/
      embeddingWorker.ts
      recommendationWorker.ts
    utils/
      logger.ts
      errors.ts
      response.ts
    types/
      express.d.ts
    index.ts
  tests/
    unit/
    integration/
    api/
  package.json
  tsconfig.json
  .env.example
  Dockerfile
  docker-compose.yml
```

## 4. Database Schema

### Users
- id, email, password_hash, name, role, preferences, created_at, updated_at

### Concepts
- id, title, definition, category, difficulty, domain, created_by, version, created_at, updated_at

### Relationships
- id, source_id, target_id, type (is_a/part_of/requires/causes/depends_on/similar_to/opposite_of/analogy_of/used_in/derived_from), confidence, source, weight, created_at, updated_at

### Analogies
- id, concept_id, user_id, content, style, difficulty, perspective, mapping, explanation, limitations, misconceptions, confidence_score, created_at

### PracticeAttempts
- id, user_id, mode, concept_id, user_answer, feedback, score, strengths, weaknesses, misconceptions, suggestions, created_at

### LearningPaths
- id, user_id, title, stages (JSON), current_stage, completed_concepts, created_at, updated_at

### KnowledgeMaps
- id, user_id, name, nodes (JSON), edges (JSON), created_at, updated_at

### Bookmarks
- id, user_id, item_type, item_id, created_at

### LearningSessions
- id, user_id, concept_id, duration, activities, created_at

## 5. Core API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Concepts
- GET /api/concepts
- GET /api/concepts/:id
- POST /api/concepts
- PUT /api/concepts/:id
- DELETE /api/concepts/:id
- GET /api/concepts/search?q=

### Analogies
- POST /api/analogies/generate
- GET /api/analogies
- GET /api/analogies/:id
- POST /api/analogies/:id/regenerate
- POST /api/analogies/:id/simplify
- POST /api/analogies/:id/expand

### Knowledge Graph
- GET /api/knowledge-graph
- GET /api/knowledge-graph/nodes/:id
- GET /api/knowledge-graph/traverse?from=&type=
- GET /api/knowledge-graph/shortest-path?from=&to=
- POST /api/knowledge-graph/relationships
- PUT /api/knowledge-graph/relationships/:id

### Learning Paths
- GET /api/learning-paths
- GET /api/learning-paths/:id
- POST /api/learning-paths/generate
- PUT /api/learning-paths/:id/progress

### Practice
- POST /api/practice/generate
- POST /api/practice/submit
- GET /api/practice/history

### Assessment
- POST /api/assessment/evaluate
- POST /api/assessment/detect-misconceptions

### Recommendations
- GET /api/recommendations/next
- GET /api/recommendations/related?concept=
- GET /api/recommendations/alternatives?analogy=

### Search
- GET /api/search?q=
- GET /api/search/semantic?q=

### Progress
- GET /api/progress/overview
- GET /api/progress/sessions
- GET /api/progress/mastery

### Settings
- GET /api/settings
- PUT /api/settings

## 6. AI Orchestration Design

All AI calls flow through `AnalogyOrchestrator`:
- Receives structured request (concept, difficulty, style, objective)
- Selects prompt from `PromptManager`
- Calls OpenRouter with retry/fallback logic
- Parses response into structured model
- Caches result
- Logs interaction
- Returns to controller

No controller calls OpenRouter directly.

## 7. Prompt Management

Prompts stored in `src/services/prompts/prompts/` as typed functions:
- `generateAnalogy.ts`
- `evaluateAnalogy.ts`
- `detectMisconceptions.ts`
- `recommendNextTopic.ts`
- `summariseConcept.ts`

Each returns a structured system + user message pair.

## 8. Implementation Phases

### Phase 1 — Foundation
- Initialize backend project with Express + TypeScript
- Set up SQLite database and migrations
- Create all models and repositories
- Implement Auth service (register, login, JWT)
- Implement middleware (auth, validation, error handling, CORS)

### Phase 2 — Core Services
- Concept Service (CRUD, search)
- Relationship Service (CRUD)
- Knowledge Graph Engine (traversal, BFS, DFS, shortest path)
- Analogy Engine (generate, simplify, expand, regenerate)
- Prompt Manager with all prompts

### Phase 3 — Learning Services
- Learning Path Engine
- Practice Engine
- Assessment Engine
- Recommendation Engine

### Phase 4 — API Routes
- Wire all services to routes
- Add request validation
- Add response formatting

### Phase 5 — Workers & Analytics
- Background embedding worker
- Analytics service
- Event system

### Phase 6 — Testing & Documentation
- Unit tests for services
- Integration tests for API
- API documentation
- Environment guide

## 9. Integration with Frontend

- Frontend `.env` will point `VITE_API_URL` to backend
- Frontend `analogyApi.js` will be refactored to call backend endpoints
- Backend serves static frontend in production
- CORS configured for dev environment

## 10. Files to Create (Summary)

```
backend/
  package.json
  tsconfig.json
  .env.example
  Dockerfile
  docker-compose.yml
  src/
    index.ts
    config/env.ts
    config/database.ts
    models/*.ts (9 models)
    repositories/*.ts (9 repositories)
    services/auth/*.ts
    services/concept/*.ts
    services/analogy/*.ts
    services/graph/*.ts
    services/learning/*.ts
    services/practice/*.ts
    services/search/*.ts
    services/analytics/*.ts
    services/prompts/*.ts + prompts/*.ts
    routes/*.ts (11 routes)
    middleware/*.ts (5 middleware)
    workers/*.ts
    utils/*.ts
    types/*.ts
  tests/
    unit/*.ts
    integration/*.ts
    api/*.ts
```

## 11. Dependencies

### Production
- express
- better-sqlite3
- bcrypt
- jsonwebtoken
- zod
- uuid
- dotenv
- cors
- express-rate-limit
- helmet

### Development
- typescript
- @types/node
- @types/express
- @types/better-sqlite3
- @types/bcrypt
- @types/jsonwebtoken
- @types/uuid
- vitest
- tsx
- eslint + typescript-eslint

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Backend complexity | Build incrementally; core CRUD first, AI later |
| SQLite limitations | Design repository interface to be database-agnostic |
| AI prompt brittleness | Version prompts; add fallback parsing |
| Frontend breakage | Keep frontend API layer backward compatible |
| Performance | Add caching layer early; lazy-load graph data |

## 13. Out of Scope (Initially)

- OAuth providers (structure ready, not implemented)
- Vector database / semantic search (interface ready, simple implementation first)
- WebSocket / real-time features
- Kubernetes deployment (Docker only)
- Mobile API versioning
