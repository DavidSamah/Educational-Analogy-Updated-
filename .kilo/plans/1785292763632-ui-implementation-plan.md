# Analogy Educational App — UI Implementation Plan

## 1. Existing Architecture (Discovered)

### Stack
- **Framework:** React 19 (Vite 8)
- **Routing:** None currently installed
- **Styling:** Plain CSS with CSS variables (`src/index.css`); no component library
- **State:** Local `useState` only; no global state manager
- **AI Integration:** OpenRouter API via `src/api/analogyApi.js`
- **Knowledge Graph:** In-memory object in `src/knowledge/graph.js` (single concept: Gravity)
- **Engines:** `lessonBuilder`, `pathFinder`, `knowledgeEngine`, `graphTraversal`, `learningOrchestrator`

### Current Pages / Features
- Single-page input form with Header, InputBox, PerspectiveSelector, GenerativeButton, Result
- App.jsx imports `findConcept` in `searchKnowledge()` but never imports it (broken)
- HeroSection.jsx is empty (`import "./"`)

### Files to Reuse
- `src/api/analogyApi.js` — preserve API contract
- `src/knowledge/graph.js` — preserve data structure
- `src/engine/*` — preserve engine logic
- `src/orchestrator/learningOrchestrator.js` — preserve orchestrator
- `src/prompts/analogyPrompt.js` — preserve prompt template
- Existing component folder (`src/components/`) — refactor rather than delete

## 2. Dependencies to Add

| Package | Purpose | Rationale |
|---------|---------|-----------|
| `react-router-dom` | Multi-page routing | Standard, lightweight, required for 9-page app shell |
| `@xyflow/react` (React Flow) | Knowledge Map graph | React-native, zoom/pan/node selection built-in, lighter than full D3 |

**Do NOT add:** heavy charting libs, component libraries (MUI/Tailwind), or animation libs.

## 3. Design System

- **Tokens:** Extend `src/index.css` variables with color scales (indigo/violet/teal), spacing scale, radius scale, shadow scale.
- **Typography:** Use system fonts already declared; add type scale via CSS variables.
- **Dark mode:** Build on existing `prefers-color-scheme` media query in `index.css`; add manual toggle via class toggle on `<html>`.
- **No CSS-in-JS or framework CSS** — keep plain CSS modules or component-scoped files.

## 4. Component Architecture

### Reusable Shell
- `AppShell` — sidebar + topbar + main content area + mobile drawer logic
- `Sidebar` — navigation items, active state, collapse/drawer behavior
- `TopBar` — page title, global search, theme toggle, user avatar

### Pages (route-level components)
- `HomePage` — hero, continue learning, feature cards, insight card
- `AnalogyGeneratorPage` — concept input, style/difficulty selectors, result card
- `KnowledgeMapPage` — React Flow graph + node detail panel
- `LearningPathPage` — visual pathway stages
- `PracticeLabPage` — mode selector + practice interface + feedback
- `ProgressPage` — stats, milestones, history
- `SavedIdeasPage` — grid/list, search, filters
- `SettingsPage` — theme, preferences (placeholder UI)

### Shared Components
- `PageHeader` — consistent page titles
- `ConceptSearch` — reusable search input
- `FeatureCard` — for home page cards
- `AnalogyResult` — structured display of generated analogies
- `LoadingSkeleton` — pulse skeletons for async states
- `EmptyState` — reusable empty state
- `ToastNotification` — success/error toasts
- `NodeDetailsPanel` — slide-out panel for Knowledge Map node info

## 5. Route Structure

```
/              → HomePage
/generate      → AnalogyGeneratorPage
/map           → KnowledgeMapPage
/learning-path → LearningPathPage
/practice      → PracticeLabPage
/progress      → ProgressPage
/saved         → SavedIdeasPage
/settings      → SettingsPage
```

## 6. Key Integration Points (Preserve Existing Logic)

- **`analogyApi.js`**: Keep exact API shape. Add `simplify`, `detail`, and `regenerate` as new functions or parameters, but do not break `generateAnalogy(concept, perspective)`.
- **`learningOrchestrator.js`**: Wrap into a custom hook `useAnalogyGeneration` that handles loading/error/success states.
- **`knowledgeEngine.js` + `graph.js`**: Feed into Knowledge Map nodes and Learning Path stages.
- **State:** Keep local state per page; introduce a single `AppContext` only for theme and saved-items if needed.

## 7. Files to Modify

- `src/App.jsx` — wrap in `BrowserRouter`, replace body with `AppShell` + `Routes`
- `src/App.css` — clear and restyle for app shell layout
- `src/index.css` — add design tokens, dark-mode class support
- `src/components/Header.jsx` — refactor into `TopBar`
- `src/components/InputBox.jsx` — fix unreachable code, refactor into `ConceptSearch`
- `src/components/GenerativeButton.jsx` — refactor into styled button
- `src/components/PerspectiveSelector.jsx` — enhance with new options (style, difficulty)
- `src/components/Result.jsx` — refactor into `AnalogyResult`

## 8. Files to Create

```
src/
  contexts/
    AppContext.jsx            # theme + saved items
  hooks/
    useAnalogyGeneration.js   # wraps learningOrchestrator + api
  pages/
    HomePage.jsx / .css
    AnalogyGeneratorPage.jsx / .css
    KnowledgeMapPage.jsx / .css
    LearningPathPage.jsx / .css
    PracticeLabPage.jsx / .css
    ProgressPage.jsx / .css
    SavedIdeasPage.jsx / .css
    SettingsPage.jsx / .css
  components/
    AppShell.jsx / .css
    Sidebar.jsx / .css
    TopBar.jsx / .css
    PageHeader.jsx / .css
    ConceptSearch.jsx / .css
    FeatureCard.jsx / .css
    AnalogyResult.jsx / .css
    LoadingSkeleton.jsx / .css
    EmptyState.jsx / .css
    ToastNotification.jsx / .css
    NodeDetailsPanel.jsx / .css
  styles/
    tokens.css               # design tokens
```

## 9. Implementation Phases

### Phase 1 — Foundation
- Install `react-router-dom` and `@xyflow/react`
- Add design tokens to `index.css`
- Create `AppContext` for theme
- Build `AppShell` (sidebar + topbar + mobile drawer)

### Phase 2 — Core Pages
- HomePage with hero, continue learning, feature cards
- AnalogyGeneratorPage with full form + result states
- KnowledgeMapPage with React Flow graph + node panel

### Phase 3 — Educational Pages
- LearningPathPage with visual stages
- PracticeLabPage with mode selector and feedback UI
- ProgressPage with stats cards
- SavedIdeasPage with grid/list and filters

### Phase 4 — Polish
- Settings page
- Loading skeletons, empty states, error states
- Toast system
- Responsive breakpoints (mobile drawer, stacked cards)
- Accessibility pass (focus states, ARIA labels, semantic HTML)

### Phase 5 — Validation
- Run `npm run dev` and test each route
- Run `npm run build` for production check
- Test mobile responsiveness via browser dev tools
- Verify existing API calls still function

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| React Flow bundle size | Use tree-shaking; keep custom nodes minimal |
| Dark mode class conflict with media query | Use `[data-theme="dark"]` selector and toggle class on `<html>` |
| Existing `searchKnowledge` is broken | Fix by importing `findConcept` from `knowledgeEngine` or remove unused path |
| Mobile drawer z-index conflicts | Define z-index tokens in `tokens.css` |

## 11. Out of Scope (Explicitly)

- Authentication / user accounts
- Persistent backend storage (saved items remain in localStorage or memory)
- Advanced AI features beyond the existing OpenRouter call
- Mobile native app wrapper
