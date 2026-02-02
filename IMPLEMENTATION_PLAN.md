# Dashboard Tessa — Implementation Plan

## Stack (proposed, confirm)
- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (optional) for quick dashboard primitives
- Zustand (or React context) for client state

## Architecture
- `/app` routes
- `components/` reusable UI
- `widgets/` each widget is a module: UI + data loader + settings
- `lib/` shared utilities (fetch, caching, types)
- `config/` widget registry + schema

## Iteration 0 checklist (scaffold)
- [ ] Next.js app created
- [ ] Tailwind configured
- [ ] Basic dashboard page with grid
- [ ] Widget registry with 1–2 sample widgets
- [ ] Dev scripts (lint/format)

## Interruption safety
- Keep tasks small and PR-like.
- Every batch ends with:
  - Updated ROADMAP.md checkmarks
  - Notes in IMPLEMENTATION_PLAN.md (decisions + next steps)

## Open questions to decide with Mamy
1. What are the **widgets** we want in the MVP?
2. Is the dashboard **local-only** (no auth) first, or do we integrate a provider immediately?
3. Preferred deployment target (or keep local)?
