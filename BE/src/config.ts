import { config as loadEnv } from "dotenv";

loadEnv();

// โหลดค่าจากไฟล์ .env (ถ้ามี) — บน server จริงให้ตั้งค่าเป็น environment variable แทน
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}

const bool = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === "" ? fallback : ["1", "true", "yes", "on"].includes(v.toLowerCase());

const int = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

export const config = {
  port: int(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl:
    process.env.DATABASE_URL || "postgres://chat:chat@localhost:5432/chat",
  // ฐานข้อมูลบนคลาวด์ (Render / Neon / Supabase) มักบังคับใช้ SSL
  databaseSsl: bool(process.env.DATABASE_SSL, false),

  // รัน migration อัตโนมัติตอนเปิด server
  autoMigrate: bool(process.env.AUTO_MIGRATE, true),
  // ใส่ข้อมูลจาก seed/portfolio.json ตอนเปิด server:
  //   always   = ทุกครั้ง (แก้ไฟล์ json แล้ว push → deploy ใหม่ ข้อมูลบนเว็บอัปเดตตาม) ← ค่าเริ่มต้น
  //   if-empty = เฉพาะตอนฐานข้อมูลยังว่าง (ใช้ถ้าแก้ข้อมูลผ่าน PUT /api/portfolio แล้วไม่อยากให้ถูกทับ)
  //   off      = ไม่ทำเลย
  seedMode: (["always", "if-empty", "off"].includes(process.env.SEED_MODE ?? "")
    ? process.env.SEED_MODE
    : "always") as "always" | "if-empty" | "off",
  seedFile: process.env.SEED_FILE || "seed/portfolio.json",

  // คั่นหลายโดเมนด้วย , เช่น https://our-group.vercel.app,http://localhost:5173  (* = อนุญาตทุกที่)
  corsOrigins: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  llm: {
    apiKey: process.env.LLM_API_KEY || "",
    baseUrl: process.env.LLM_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: process.env.LLM_MODEL || "gemini-3.5-flash-lite",
    timeoutMs: int(process.env.LLM_TIMEOUT_MS, 20_000),
  },

  // BE อยู่หลัง proxy หลายชั้น (Render + nginx ของ FE) → เชื่อ X-Forwarded-For เพื่อให้รู้ IP จริงของผู้ใช้
  // true = เชื่อทุกชั้น (ค่าเริ่มต้น), ตัวเลข = จำนวนชั้นที่เชื่อ, false = ไม่เชื่อ (ใช้ IP ที่ต่อเข้ามาตรง ๆ)
  trustProxy: ((v) =>
    v === undefined || v === "" || v === "true" ? true : v === "false" ? false : Number(v) || true)(
    process.env.TRUST_PROXY,
  ) as boolean | number,

  chat: {
    // จำนวนข้อความย้อนหลังที่ส่งให้ AI เป็นบริบท
    maxHistory: int(process.env.CHAT_MAX_HISTORY, 10),
    maxMessageLength: int(process.env.CHAT_MAX_LENGTH, 1000),
    // จำกัดจำนวนครั้งที่เรียกแชตต่อ IP ต่อนาที กันโควตา AI หมด
    rateLimitPerMinute: int(process.env.CHAT_RATE_LIMIT, 20),
  },

  // ตั้งค่านี้เพื่อเปิด endpoint แก้ไข portfolio / ดูประวัติแชตทั้งหมด (ไม่ตั้ง = ปิด)
  adminToken: process.env.ADMIN_TOKEN || "",
};

export type Config = typeof config;
