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
- [x] Next.js app created
- [x] Tailwind configured
- [x] Basic dashboard page with grid
- [x] Widget registry with 1–2 sample widgets
- [x] Dev scripts (lint/format)

## Scaffold Notes
- initialized with Next.js 16 (Canary/Latest?) + React 19 + Tailwind 4 (via `@tailwindcss/postcss`).
- `widgets/` folder created for widget components.
- `config/widget-registry.ts` created for mapping IDs to components.
- Added `prettier` and `format` script.
- Used `app/page.tsx` for the main dashboard grid.
- NOTE: Tailwind v4 usage implies standard `postcss` config, might differ slightly from v3 `tailwind.config.js`. It uses CSS-first configuration.

## Interruption safety
- Keep tasks small and PR-like.
- Every batch ends with:
  - Updated ROADMAP.md checkmarks
  - Notes in IMPLEMENTATION_PLAN.md (decisions + next steps)

## Open questions to decide with Mamy
1. What are the **widgets** we want in the MVP?
2. Is the dashboard **local-only** (no auth) first, or do we integrate a provider immediately?
3. Preferred deployment target (or keep local)?
