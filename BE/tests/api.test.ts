import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatTurn, LlmFn } from "../src/ai/llm";
import { LlmError } from "../src/ai/llm";
import { createApp } from "../src/app";
import { pool } from "../src/db/pool";
import { portfolioInput } from "../src/portfolio/schema";
import { fixture, realSeed, resetDb } from "./helpers";

const fakeLlm = vi.fn<LlmFn>(async (_system, turns) => `ตอบ: ${turns.at(-1)?.content}`);
const app = createApp({ llm: fakeLlm, adminToken: "secret-token" });

beforeEach(async () => {
  fakeLlm.mockClear();
  await resetDb();
});
afterAll(() => pool.end());

describe("health", () => {
  it("รายงานสถานะฐานข้อมูล", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", db: "up" });
  });
});

describe("portfolio", () => {
  it("คืนข้อมูลกลุ่ม ผลงานกลุ่ม ช่องทางติดต่อ และสมาชิกพร้อมผลงานของแต่ละคน", async () => {
    const res = await request(app).get("/api/portfolio");
    expect(res.status).toBe(200);
    expect(res.body.group.name).toBe("Team Byte");
    expect(res.body.projects).toHaveLength(1);
    expect(res.body.contacts[0].value).toBe("team@example.com");
    expect(res.body.members.map((m: any) => m.slug)).toEqual(["alice", "bob"]);
    expect(res.body.members[0].projects[0].title).toBe("Queue Robot");
    expect(res.body.members[0].contacts[0].type).toBe("github");
  });

  it("404 เมื่อยังไม่มีข้อมูล", async () => {
    await resetDb(null);
    expect((await request(app).get("/api/portfolio")).status).toBe(404);
  });

  it("ดูสมาชิกรายคนด้วย slug", async () => {
    const ok = await request(app).get("/api/members/bob");
    expect(ok.status).toBe(200);
    expect(ok.body.role).toBe("Frontend Developer");
    expect((await request(app).get("/api/members/nobody")).status).toBe(404);
  });

  it("ไฟล์ seed/portfolio.json ผ่านการตรวจรูปแบบ", () => {
    expect(() => portfolioInput.parse(realSeed())).not.toThrow();
  });
});

describe("chat", () => {
  it("บันทึกประวัติลงฐานข้อมูล และส่งประวัติเดิมเป็นบริบทในข้อความถัดไป", async () => {
    const first = await request(app).post("/api/chat").send({ text: "สวัสดี" });
    const id = first.body.conversationId;
    expect(id).toMatch(/^[0-9a-f-]{36}$/);

    await request(app).post("/api/chat").send({ text: "บ็อบทำอะไร", conversationId: id }).expect(201);
    const turns: ChatTurn[] = fakeLlm.mock.calls[1][1];
    expect(turns.map((t) => t.role)).toEqual(["user", "assistant", "user"]);
    expect(turns[0].content).toBe("สวัสดี");

    const hist = await request(app).get(`/api/conversations/${id}/messages`);
    expect(hist.status).toBe(200);
    expect(hist.body.messages.map((m: any) => m.text)).toEqual([
      "สวัสดี",
      "ตอบ: สวัสดี",
      "บ็อบทำอะไร",
      "ตอบ: บ็อบทำอะไร",
    ]);
  });

  it("แยกประวัติของแต่ละบทสนทนาออกจากกัน", async () => {
    const a = await request(app).post("/api/chat").send({ text: "A" });
    await request(app).post("/api/chat").send({ text: "B" });
    const hist = await request(app).get(`/api/conversations/${a.body.conversationId}/messages`);
    expect(hist.body.messages).toHaveLength(2);
  });

  it("ตรวจข้อความที่ส่งมา", async () => {
    expect((await request(app).post("/api/chat").send({ text: "   " })).status).toBe(400);
    expect((await request(app).post("/api/chat").send({})).status).toBe(400);
    expect((await request(app).post("/api/chat").send({ text: "x".repeat(1001) })).status).toBe(400);
    expect((await request(app).post("/api/chat").send({ text: "hi", conversationId: "abc" })).status).toBe(400);
    const bad = await request(app).post("/api/chat").set("content-type", "application/json").send("{oops");
    expect(bad.status).toBe(400);
    expect(fakeLlm).not.toHaveBeenCalled();
  });

  it("AI ล่มแล้วตอบ 502 / โควตาเต็มตอบ 429 และไม่บันทึกข้อความครึ่ง ๆ", async () => {
    fakeLlm.mockRejectedValueOnce(new LlmError("boom", 500));
    expect((await request(app).post("/api/chat").send({ text: "hi" })).status).toBe(502);
    fakeLlm.mockRejectedValueOnce(new LlmError("quota", 429));
    expect((await request(app).post("/api/chat").send({ text: "hi" })).status).toBe(429);
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM messages");
    expect(rows[0].n).toBe(0);
  });

  it("ลบบทสนทนาได้", async () => {
    const { body } = await request(app).post("/api/chat").send({ text: "hi" });
    expect((await request(app).delete(`/api/conversations/${body.conversationId}`)).status).toBe(204);
    expect((await request(app).delete(`/api/conversations/${body.conversationId}`)).status).toBe(404);
    const hist = await request(app).get(`/api/conversations/${body.conversationId}/messages`);
    expect(hist.body.messages).toEqual([]);
  });

  it("จำกัดความถี่การส่งข้อความ", async () => {
    const limited = createApp({ llm: fakeLlm, rateLimitPerMinute: 2 });
    await request(limited).post("/api/chat").send({ text: "1" }).expect(201);
    await request(limited).post("/api/chat").send({ text: "2" }).expect(201);
    expect((await request(limited).post("/api/chat").send({ text: "3" })).status).toBe(429);
  });
});

describe("admin", () => {
  const auth = { Authorization: "Bearer secret-token" };

  it("ต้องมี token ถึงจะแก้ portfolio ได้", async () => {
    expect((await request(app).put("/api/portfolio").send(fixture)).status).toBe(401);
    expect((await request(createApp()).put("/api/portfolio").set(auth).send(fixture)).status).toBe(404);
  });

  it("แก้ portfolio ทั้งชุดได้", async () => {
    const updated = { ...fixture, group: { ...fixture.group, name: "Team Renamed" } };
    const res = await request(app).put("/api/portfolio").set(auth).send(updated);
    expect(res.status).toBe(200);
    expect(res.body.group.name).toBe("Team Renamed");
  });

  it("ปฏิเสธข้อมูลผิดรูปแบบโดยไม่ทำให้ข้อมูลเดิมเสีย", async () => {
    const res = await request(app)
      .put("/api/portfolio")
      .set(auth)
      .send({ ...fixture, members: [fixture.members[0], fixture.members[0]] });
    expect(res.status).toBe(400);
    expect((await request(app).get("/api/portfolio")).body.members).toHaveLength(2);
  });

  it("ไม่รับลิงก์ที่ไม่ใช่ http/https (กัน javascript: XSS)", async () => {
    const bad = structuredClone(fixture);
    bad.projects[0].url = "javascript:alert(1)";
    const res = await request(app).put("/api/portfolio").set(auth).send(bad);
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toBe("projects.0.url");
  });

  it("ดูรายการบทสนทนาทั้งหมด", async () => {
    await request(app).post("/api/chat").send({ text: "คำถามแรก" });
    const res = await request(app).get("/api/admin/conversations").set(auth);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ messageCount: 2, firstQuestion: "คำถามแรก" });
  });
});

describe("rate limit หลัง proxy (FE nginx → BE)", () => {
  it("แยกโควตาตาม IP จริงของผู้ใช้จาก X-Forwarded-For ไม่ใช่ IP ของ nginx", async () => {
    const limited = createApp({ llm: fakeLlm, rateLimitPerMinute: 1, trustProxy: true });
    const send = (ip: string) =>
      request(limited).post("/api/chat").set("X-Forwarded-For", ip).send({ text: "hi" });
    expect((await send("1.1.1.1")).status).toBe(201);
    expect((await send("2.2.2.2")).status).toBe(201); // คนละคน ต้องไม่โดนจำกัด
    expect((await send("1.1.1.1")).status).toBe(429);
  });
});
