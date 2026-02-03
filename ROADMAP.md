# Dashboard Tessa — Roadmap

## Goal

Build an iterative personal dashboard (similar vibe to the referenced tweet) with modular widgets and a clean “single pane” UI.

## Iterations (feature batches)

0. **Scaffold + DX**
   - [x] Repo, lint/format, basic layout, widget framework.

1. **MVP Dashboard Shell**
   - [x] Responsive grid layout
   - [ ] Sidebar/topbar
   - [x] Static sample widgets (placeholders)

2. **Feature 1: Mission Control MVP**
   - [x] SQLite + Prisma setup (Agents, Tasks, Activity)
   - [x] Backend API (CRUD + SSE Realtime Stream)
   - [x] Frontend UI (Agents Panel, Kanban, Activity Feed)
   - [x] Realtime updates via Server-Sent Events

3. **Feature 2: Enhanced Mission Control**
   - [x] Task Detail Drawer (Right-side slide-over)
   - [x] Comments Thread & Composer
   - [x] @Mentions & Notifications system
   - [x] Moltbot Session Mapping (Manual UI)

4. **Data Layer v1**
   - [x] Widget config schema
   - [x] Local mock data + caching
   - [x] Refresh controls (manual + interval)

5. **Core Widgets (pick 3–5)**
   - [x] Today/agenda
   - [x] Tasks/todos
   - [x] Focus timer / “deep work”
   - [ ] Weather
   - [ ] Notes

6. **Persistence**
   - [x] Store widget layout + settings (localStorage first, then DB)

7. **Auth + Integrations**
   - [ ] OAuth for providers (Google/Notion/GitHub/etc.)

8. **Theming + UX polish**
   - [ ] Dark mode, compact mode, keyboard shortcuts

9. **Deploy**
   - [ ] Vercel/Fly/Render + env management

10. **Testing**
    - [x] Vitest setup (unit + integration)
    - [x] API route coverage
    - [x] Hooks + lib utilities coverage

## Working agreement

- **Before each new feature:** we do a quick design discussion (scope + UX + data source + edge cases) and only then implement.
