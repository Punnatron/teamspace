// test ของส่วน AI (สมาชิกคนที่ 3) — ตรวจว่า AI ได้ข้อมูล portfolio ครบและตอบได้แม้ไม่มี API key
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { offlineReply } from "../src/ai/fallback";
import type { LlmFn } from "../src/ai/llm";
import { buildSystemPrompt } from "../src/ai/prompt";
import { createApp } from "../src/app";
import { pool } from "../src/db/pool";
import type { Portfolio } from "../src/portfolio/repository";
import { fixture, resetDb } from "./helpers";

const p: Portfolio = {
  group: { name: "G", tagline: "", concept: "แนวคิด", highlights: [], updatedAt: "" },
  projects: [],
  contacts: [],
  members: [
    { id: 1, slug: "a", name: "Somchai Jaidee", nickname: "ชาย", role: "Dev", bio: "", skills: ["Go"], avatarUrl: null, projects: [], contacts: [] },
  ],
};

describe("system prompt", () => {
  it("มีกฎห้ามแต่งข้อมูลและข้อมูลสมาชิก", () => {
    const s = buildSystemPrompt(p);
    expect(s).toContain("ห้ามแต่งข้อมูล");
    expect(s).toContain("Somchai Jaidee (ชื่อเล่น: ชาย)");
    expect(s).toContain("ทั้งหมด 1 คน");
  });

  it("บอก AI เมื่อยังไม่มีข้อมูล", () => {
    expect(buildSystemPrompt(null)).toContain("ยังไม่มีข้อมูล portfolio");
  });
});

describe("offline reply", () => {
  it("หาสมาชิกจากชื่อเล่นหรือชื่อจริง", () => {
    expect(offlineReply("ชายทำอะไร", p)).toContain("Dev");
    expect(offlineReply("tell me about somchai", p)).toContain("Go");
  });
});

describe("AI ผ่าน API แชต", () => {
  const fakeLlm = vi.fn<LlmFn>(async (_system, turns) => `ตอบ: ${turns.at(-1)?.content}`);
  const app = createApp({ llm: fakeLlm, adminToken: "secret-token" });

  beforeEach(async () => {
    fakeLlm.mockClear();
    await resetDb();
  });
  afterAll(() => pool.end());

  it("ส่ง portfolio ของทั้งกลุ่มและสมาชิกทุกคนเป็น system prompt ให้ AI", async () => {
    const res = await request(app).post("/api/chat").send({ text: "อลิซถนัดอะไร" });
    expect(res.status).toBe(201);
    const [system] = fakeLlm.mock.calls[0];
    for (const s of ["Team Byte", "Chat Portfolio", "team@example.com", "Alice Wong", "อลิซ", "Queue Robot", "PostgreSQL", "Bob Lee", "Frontend Developer"]) {
      expect(system).toContain(s);
    }
  });

  it("แก้ portfolio แล้ว AI เห็นข้อมูลใหม่ทันที", async () => {
    const updated = { ...fixture, group: { ...fixture.group, name: "Team Renamed" } };
    await request(app).put("/api/portfolio").set("Authorization", "Bearer secret-token").send(updated).expect(200);
    await request(app).post("/api/chat").send({ text: "ชื่อกลุ่มอะไร" });
    expect(fakeLlm.mock.calls[0][0]).toContain("Team Renamed");
  });

  it("โหมดออฟไลน์ (ไม่มี API key) ยังตอบจากข้อมูล portfolio", async () => {
    const res = await request(createApp()).post("/api/chat").send({ text: "บ็อบเป็นใคร" });
    expect(res.status).toBe(201);
    expect(res.body.assistantMessage.text).toContain("Frontend Developer");
  });
});
