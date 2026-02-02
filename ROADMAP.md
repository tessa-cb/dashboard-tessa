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

2. **Data Layer v1**
   - [ ] Widget config schema
   - [ ] Local mock data + caching
   - [ ] Refresh controls (manual + interval)

3. **Core Widgets (pick 3–5)**
   - [ ] Today/agenda
   - [ ] Tasks/todos
   - [ ] Focus timer / “deep work”
   - [ ] Weather
   - [ ] Notes

4. **Persistence**
   - [ ] Store widget layout + settings (localStorage first, then DB)

5. **Auth + Integrations**
   - [ ] OAuth for providers (Google/Notion/GitHub/etc.)

6. **Theming + UX polish**
   - [ ] Dark mode, compact mode, keyboard shortcuts

7. **Deploy**
   - [ ] Vercel/Fly/Render + env management

## Working agreement
- **Before each new feature:** we do a quick design discussion (scope + UX + data source + edge cases) and only then implement.
