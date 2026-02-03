# dashboard-tessa

Iterative personal dashboard (Tessa)

## Requirements

- Node.js **22 LTS** (Prisma currently fails on very new Node versions like v25 in this repo)

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Testing

```bash
npm test
```

Notes
- Tests use Vitest + SQLite `test.db` with Prisma migrations.
- Hooks tests run in `jsdom`; API + lib tests run in `node`.

## UX

- Theme: system/light/dark (`D` to cycle)
- Density: comfortable/compact (`C` to toggle)
- Shortcuts help: `?` (Shift + `/`)
- Refresh all widgets: `R`

If you use `nvm`:

```bash
nvm install 22
nvm use 22
```
