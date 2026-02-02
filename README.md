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

If you use `nvm`:
```bash
nvm install 22
nvm use 22
```
