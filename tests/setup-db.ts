import { afterAll, afterEach, beforeAll } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { resetDb } from "./helpers/db";

declare global {
  // eslint-disable-next-line no-var
  var __testDbReady: boolean | undefined;
}

const dbPath = path.join(process.cwd(), "test.db");

beforeAll(() => {
  if (globalThis.__testDbReady) return;

  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
  }

  execSync("npx prisma migrate deploy --schema prisma/schema.prisma", {
    stdio: "ignore",
    env: {
      ...process.env,
      DATABASE_URL: "file:./test.db",
    },
  });

  globalThis.__testDbReady = true;
});

afterEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
  }
});
