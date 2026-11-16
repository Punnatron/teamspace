import { randomUUID } from "node:crypto";
import { offlineReply } from "../ai/fallback";
import { askLlm, isLlmConfigured, type LlmFn } from "../ai/llm";
import { buildSystemPrompt } from "../ai/prompt";
import { config } from "../config";
import { getPortfolio } from "../portfolio/repository";
import * as repo from "./repository";

export interface ChatDeps {
  // ส่ง llm ปลอมเข้ามาได้ตอนทดสอบ; ถ้าไม่ส่งจะใช้ AI จริง (หรือโหมดออฟไลน์ถ้าไม่มี key)
  llm?: LlmFn;
}

let warned = false;

export async function chat(text: string, conversationId: string | undefined, deps: ChatDeps = {}) {
  const id = conversationId ?? randomUUID();
  const [portfolio, history] = await Promise.all([
    getPortfolio(), // อ่านใหม่ทุกครั้ง แก้ข้อมูลแล้วบอทรู้ทันที
    conversationId ? repo.recentMessages(id, config.chat.maxHistory) : Promise.resolve([]),
  ]);

  const llm = deps.llm ?? (isLlmConfigured() ? askLlm : undefined);
  let reply: string;
  if (llm) {
    reply = await llm(buildSystemPrompt(portfolio), [
      ...history.map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: text },
    ]);
  } else {
    if (!warned) {
      console.warn("⚠️  ยังไม่ได้ตั้ง LLM_API_KEY — ใช้คำตอบโหมดออฟไลน์แทน AI จริง (ดู .env.example)");
      warned = true;
    }
    reply = offlineReply(text, portfolio);
  }

  const [userMessage, assistantMessage] = await repo.addExchange(id, text, reply);
  return { conversationId: id, userMessage, assistantMessage };
}
