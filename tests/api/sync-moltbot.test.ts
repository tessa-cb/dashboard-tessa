import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { POST } from "@/app/api/sync/moltbot/route";
import { createAgent } from "../helpers/db";

describe("api/sync/moltbot", () => {
  it("POST syncs session keys from local file", async () => {
    const filePath = path.join(process.cwd(), "moltbot-sessions.json");
    const original = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : null;

    try {
      const agent = await createAgent({ name: "Tessa" });

      fs.writeFileSync(
        filePath,
        JSON.stringify([{ agentName: "Tessa", sessionKey: "session-123" }], null, 2),
        "utf-8",
      );

      const res = await POST(new Request("http://localhost/api/sync/moltbot", { method: "POST" }));
      expect(res.status).toBe(200);

      const updated = await prisma.agent.findUnique({ where: { id: agent.id } });
      expect(updated?.sessionKey).toBe("session-123");
    } finally {
      if (original !== null) {
        fs.writeFileSync(filePath, original, "utf-8");
      }
    }
  });
});
