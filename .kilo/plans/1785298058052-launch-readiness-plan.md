# Launch Readiness Plan

## Current State Inspection Summary

### Frontend
- **Framework**: React 19 + Vite 8, react-router-dom 7, @xyflow/react 12
- **Pages**: Home, AnalogyGenerator, KnowledgeMap, LearningPath, PracticeLab, Progress, Settings, SavedIdeas
- **API Client**: `src/api/analogyApi.js` calls OpenRouter directly; no backend consumption yet
- **State**: `src/contexts/AppContext.jsx`
- **Issue**: Frontend works independently but cannot use backend because backend does not start

### Backend
- **Framework**: Express 4 + TypeScript 5.9 + better-sqlite3 11
- **Build**: `tsx watch src/index.ts`
- **Test**: `vitest run`
- **Env**: `backend/.env.example` exists; `backend/.env` missing
- **Database**: SQLite with WAL, foreign keys, 9 tables, indexes defined in `config/database.ts`
- **Auth**: JWT + bcrypt complete in existing services
- **Repositories**: All 9 CRUD repositories exist
- **Models**: TypeScript interfaces complete
- **Services Existing**: `auth/*`, `concept/ConceptService`, `analogy/AnalogyEngine`, `ai/orchestrator`, `graph/engine`, `search/engine`, `recommendation/engine`
- **Services Missing**: `practice/*`, `learning/*`, `assessment/*`, `analytics/*`, `prompts/**`
- **Routes**: Empty directory
- **Middleware**: Empty directory
- **Utils**: Empty directory
- **Events**: Missing
- **Workers**: Empty directory
- **Tests**: Missing
- **Entry Point**: `src/index.ts` missing

## Critical Finding

The backend cannot start. `backend/src/index.ts` does not exist. Without it, `npm run dev` fails immediately. Additionally, the previously planned patches to `AuthService.ts`, `ConceptService.ts`, and `AnalogyEngine.ts` were never applied. The existing `AnalogyEngine.ts` and `orchestrator.ts` import missing files (`PromptManager`, `utils/logger`, `utils/formatters`, `utils/errors`, `middleware/auth`).

## Implementation Plan

### Phase 0 — Environment Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Install missing devDependencies: `supertest`, `@types/supertest`

### Phase 1 — Core Infrastructure (missing files)
1. Create `backend/src/index.ts` (Express bootstrap, health check, route mounts, graceful shutdown)
2. Create `backend/src/middleware/auth.ts` (JWT guard, admin only)
3. Create `backend/src/middleware/errorHandler.ts` (centralized error handler)
4. Create `backend/src/middleware/logger.ts` (request logger)
5. Create `backend/src/middleware/validate.ts` (Zod wrapper)
6. Create `backend/src/utils/errors.ts` (AppError, NotFoundError, etc.)
7. Create `backend/src/utils/logger.ts` (structured JSON logger)
8. Create `backend/src/utils/formatters.ts` (formatDate, truncate, similarity)

### Phase 2 — Apply Patches to Existing Files
1. Patch `backend/src/services/auth/AuthService.ts` — add `verifyRefreshToken` import (line 3)
2. Patch `backend/src/services/concept/ConceptService.ts` — add `NotFoundError` import and replace generic throws
3. Patch `backend/src/services/analogy/AnalogyEngine.ts` — add `env` import; replace `callAI` with robust version + TODO for orchestrator

### Phase 3 — Events, Workers, Prompts (missing files)
1. Create `backend/src/events/emitter.ts` (EventEmitter + DomainEvents)
2. Create `backend/src/workers/embeddingWorker.ts`
3. Create `backend/src/workers/analyticsWorker.ts`
4. Create `backend/src/prompts/promptManager.ts`
5. Create 10 prompt template files under `backend/src/prompts/prompts/`

### Phase 4 — Missing Services
1. Create `backend/src/services/practice/engine.ts`
2. Create `backend/src/services/learning/pathEngine.ts`
3. Create `backend/src/services/assessment/engine.ts`
4. Create `backend/src/services/analytics/service.ts`

### Phase 5 — API Routes (missing files)
1. Create `backend/src/routes/auth.ts`
2. Create `backend/src/routes/concepts.ts`
3. Create `backend/src/routes/analogies.ts`
4. Create `backend/src/routes/graph.ts`
5. Create `backend/src/routes/practice.ts`
6. Create `backend/src/routes/assessment.ts`
7. Create `backend/src/routes/recommendations.ts`
8. Create `backend/src/routes/search.ts`
9. Create `backend/src/routes/progress.ts`
10. Create `backend/src/routes/settings.ts`
11. Create `backend/src/routes/events.ts`

### Phase 6 — Tests (missing files)
1. Create `backend/tests/auth.test.ts`
2. Create `backend/tests/graph.test.ts`
3. Create `backend/tests/search.test.ts`
4. Create `backend/tests/recommendation.test.ts`
5. Create `backend/tests/learning.test.ts`
6. Create `backend/tests/practice.test.ts`
7. Create `backend/tests/assessment.test.ts`
8. Create `backend/tests/api.test.ts`
9. Create `backend/tests/analytics.test.ts`

### Phase 7 — Compile and Fix
1. Run `npx tsc --noEmit`
2. Fix any TypeScript errors
3. Run `npm test`
4. Fix any failing tests

### Phase 8 — Seed Creator as First Customer
1. Create a seed script `backend/scripts/seed.ts`
2. Register creator user: `creator@analogy.app` / `CreatorPass123!`
3. Seed initial concepts, relationships, analogies
4. Create initial learning path for creator

### Phase 9 — Launch Verification
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd analogy && npm run dev`
3. Verify health: `curl http://localhost:3001/health`
4. Test registration/login flow
5. Test analogy generation
6. Test knowledge graph traversal
7. Test recommendations
8. Run full test suite
9. Verify no console errors
10. Verify no build warnings

## Validation Criteria

- [ ] `npm run build` succeeds for both frontend and backend
- [ ] `npm test` passes (all tests green)
- [ ] Backend server starts without crashing
- [ ] Health endpoint returns 200
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Creator can register and log in
- [ ] Analogy generation works via backend API
- [ ] Knowledge graph endpoints return data
- [ ] Recommendations return data
- [ ] No hardcoded secrets in code
- [ ] No critical console errors
- [ ] No TypeScript compilation errors

## Deployment Files to Generate

- `Dockerfile` (backend)
- `docker-compose.yml`
- `.env.production.example`
- `README.md` deployment section

## Files to Create (Complete List)

**Infrastructure (8):**
- `backend/src/index.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/src/middleware/logger.ts`
- `backend/src/middleware/validate.ts`
- `backend/src/utils/errors.ts`
- `backend/src/utils/logger.ts`
- `backend/src/utils/formatters.ts`

**Events & Workers (3):**
- `backend/src/events/emitter.ts`
- `backend/src/workers/embeddingWorker.ts`
- `backend/src/workers/analyticsWorker.ts`

**Prompt Management (11):**
- `backend/src/prompts/promptManager.ts`
- `backend/src/prompts/prompts/generateAnalogy.txt`
- `backend/src/prompts/prompts/evaluateAnalogy.txt`
- `backend/src/prompts/prompts/generateLearningPath.txt`
- `backend/src/prompts/prompts/detectMisconceptions.txt`
- `backend/src/prompts/prompts/recommendNextTopic.txt`
- `backend/src/prompts/prompts/summariseConcept.txt`
- `backend/src/prompts/prompts/regenerate.txt`
- `backend/src/prompts/prompts/simplify.txt`
- `backend/src/prompts/prompts/expand.txt`

**Services (4):**
- `backend/src/services/practice/engine.ts`
- `backend/src/services/learning/pathEngine.ts`
- `backend/src/services/assessment/engine.ts`
- `backend/src/services/analytics/service.ts`

**Routes (11):**
- `backend/src/routes/auth.ts`
- `backend/src/routes/concepts.ts`
- `backend/src/routes/analogies.ts`
- `backend/src/routes/graph.ts`
- `backend/src/routes/practice.ts`
- `backend/src/routes/assessment.ts`
- `backend/src/routes/recommendations.ts`
- `backend/src/routes/search.ts`
- `backend/src/routes/progress.ts`
- `backend/src/routes/settings.ts`
- `backend/src/routes/events.ts`

**Tests (9):**
- `backend/tests/auth.test.ts`
- `backend/tests/graph.test.ts`
- `backend/tests/search.test.ts`
- `backend/tests/recommendation.test.ts`
- `backend/tests/learning.test.ts`
- `backend/tests/practice.test.ts`
- `backend/tests/assessment.test.ts`
- `backend/tests/api.test.ts`
- `backend/tests/analytics.test.ts`

**Scripts (1):**
- `backend/scripts/seed.ts`

**Docs/Config (3):**
- `Dockerfile`
- `docker-compose.yml`
- `.env.production.example`

## Files to Patch (3)
- `backend/src/services/auth/AuthService.ts` — add `verifyRefreshToken` import
- `backend/src/services/concept/ConceptService.ts` — add `NotFoundError`, replace generic throws
- `backend/src/services/analogy/AnalogyEngine.ts` — add `env` import, replace `callAI` method

## Open Questions

1. Should the frontend continue calling OpenRouter directly, or should it be migrated to consume the new backend API? **Recommended**: Keep frontend working during migration; backend provides parallel API.
2. Should we use a vector database now or add it later? **Recommended**: Add placeholder now, implement after launch.
3. Should Docker support multi-stage builds for separate frontend/backend? **Recommended**: Yes.

## Risks

- **TypeScript compilation errors**: Existing service files import files that do not exist yet. Must create utilities and middleware before services.
- **Circular dependencies**: `orchestrator.ts` depends on `promptManager`, which depends on prompts directory. Ensure correct file placement.
- **Test environment**: `better-sqlite3` may need rebuild in CI. Pin version and document.
- **AI key security**: Frontend `.env` has VITE_OPENROUTER_API_KEY exposed. Backend should proxy AI requests to avoid exposing key in client bundle.
