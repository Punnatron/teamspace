import { timingSafeEqual } from "node:crypto";
import { Router, type RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { isLlmConfigured } from "../ai/llm";
import * as chatRepo from "../chat/repository";
import { chat, type ChatDeps } from "../chat/service";
import { config } from "../config";
import { pingDb } from "../db/pool";
import { getPortfolio, savePortfolio } from "../portfolio/repository";
import { portfolioInput } from "../portfolio/schema";
import { HttpError } from "./errors";

// Express 5 จับ error จาก async handler ให้เอง (throw แล้วไปที่ errorHandler ใน errors.ts)

export interface RouteOptions extends ChatDeps {
  rateLimitPerMinute?: number;
  trustProxy?: boolean | number;
  adminToken?: string;
}

const uuid = z.uuid({ message: "conversationId ต้องเป็น UUID" });

export function apiRouter(opts: RouteOptions = {}): Router {
  const r = Router();
  const adminToken = opts.adminToken ?? config.adminToken;

  // ---------- Health ----------
  r.get("/health", async (_req, res) => {
    const db = await pingDb();
    res.status(db ? 200 : 503).json({
      status: db ? "ok" : "degraded",
      db: db ? "up" : "down",
      llm: isLlmConfigured() ? "configured" : "offline-mode",
      time: new Date().toISOString(),
    });
  });

  // ---------- Portfolio ----------
  r.get("/portfolio", async (_req, res) => {
    const p = await getPortfolio();
    if (!p) throw new HttpError(404, "ยังไม่มีข้อมูล portfolio (รัน npm run seed)");
    res.json(p);
  });

  r.get("/members", async (_req, res) => {
    const p = await getPortfolio();
    res.json(p?.members ?? []);
  });

  r.get("/members/:slug", async (req, res) => {
    const p = await getPortfolio();
    const m = p?.members.find((x) => x.slug === req.params.slug);
    if (!m) throw new HttpError(404, "ไม่พบสมาชิกคนนี้");
    res.json(m);
  });

  // ---------- Chat ----------
  const chatBody = z.object({
    text: z
      .string({ message: "text is required" })
      .trim()
      .min(1, "text is required")
      .max(config.chat.maxMessageLength, `ข้อความยาวได้ไม่เกิน ${config.chat.maxMessageLength} ตัวอักษร`),
    conversationId: uuid.optional(),
  });

  const chatLimiter = rateLimit({
    windowMs: 60_000,
    limit: opts.rateLimitPerMinute ?? config.chat.rateLimitPerMinute,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "ส่งข้อความถี่เกินไป รอสักครู่แล้วลองใหม่" },
    // ตั้งใจเชื่อ X-Forwarded-For ทั้งสาย (ดู TRUST_PROXY ใน config.ts) จึงปิดคำเตือนของไลบรารี
    validate: { trustProxy: false },
  });

  r.post("/chat", chatLimiter, async (req, res) => {
    const { text, conversationId } = chatBody.parse(req.body ?? {});
    const result = await chat(text, conversationId, { llm: opts.llm });
    res.status(201).json(result);
  });

  r.get("/conversations/:id/messages", async (req, res) => {
    const id = uuid.parse(req.params.id);
    // conversation ที่ยังไม่มีข้อความ = ประวัติว่าง (ไม่ใช่ error) FE จะได้ใช้ง่าย
    res.json({ conversationId: id, messages: await chatRepo.listMessages(id) });
  });

  r.delete("/conversations/:id", async (req, res) => {
    const id = uuid.parse(req.params.id);
    if (!(await chatRepo.deleteConversation(id))) throw new HttpError(404, "ไม่พบบทสนทนานี้");
    res.status(204).end();
  });

  // ---------- Admin (ต้องตั้ง ADMIN_TOKEN และส่ง Authorization: Bearer <token>) ----------
  const requireAdmin: RequestHandler = (req, _res, next) => {
    if (!adminToken) return next(new HttpError(404, "admin API ปิดอยู่ (ไม่ได้ตั้ง ADMIN_TOKEN)"));
    const got = Buffer.from((req.headers.authorization ?? "").replace(/^Bearer\s+/i, ""));
    const want = Buffer.from(adminToken);
    if (got.length !== want.length || !timingSafeEqual(got, want)) {
      return next(new HttpError(401, "token ไม่ถูกต้อง"));
    }
    next();
  };

  r.put("/portfolio", requireAdmin, async (req, res) => {
    await savePortfolio(portfolioInput.parse(req.body));
    res.json(await getPortfolio());
  });

  const pageQuery = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  });

  r.get("/admin/conversations", requireAdmin, async (req, res) => {
    const { limit, offset } = pageQuery.parse(req.query);
    res.json(await chatRepo.listConversations(limit, offset));
  });

  return r;
}
