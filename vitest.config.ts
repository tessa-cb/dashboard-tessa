import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [
      "./tests/setup-env.ts",
      "./tests/setup-storage.ts",
      "./tests/setup-db.ts",
    ],
    include: ["tests/**/*.test.ts"],
    environmentMatchGlobs: [["tests/hooks/**/*.test.ts", "jsdom"]],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
