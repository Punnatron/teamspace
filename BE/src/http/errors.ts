import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { LlmError } from "../ai/llm";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: `ไม่พบ ${req.method} ${req.path}` });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "ข้อมูลไม่ถูกต้อง",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "body ต้องเป็น JSON ที่ถูกต้อง" });
    return;
  }
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "ข้อมูลใหญ่เกินไป" });
    return;
  }
  if (err instanceof LlmError) {
    console.error("LLM error:", err.status ?? "-", err.message);
    if (err.status === 429) {
      res.status(429).json({ error: "เรียก AI ถี่เกินโควตา รอสักครู่แล้วลองใหม่" });
    } else {
      res.status(502).json({ error: "เรียก AI ไม่สำเร็จ ลองใหม่อีกครั้ง (ผู้ดูแลตรวจ LLM_API_KEY / LLM_MODEL)" });
    }
    return;
  }
  console.error(err);
  res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
};
