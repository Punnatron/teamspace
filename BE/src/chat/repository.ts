import { pool, withTransaction } from "../db/pool";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

type Row = Record<string, any>;

const toMessage = (r: Row): ChatMessage => ({
  id: Number(r.id), // BIGSERIAL มาเป็น string จาก pg
  role: r.role,
  text: r.text,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function conversationExists(id: string): Promise<boolean> {
  const r = await pool.query("SELECT 1 FROM conversations WHERE id = $1", [id]);
  return (r.rowCount ?? 0) > 0;
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const r = await pool.query(
    "SELECT id, role, text, created_at FROM messages WHERE conversation_id = $1 ORDER BY id",
    [conversationId],
  );
  return r.rows.map(toMessage);
}

// n ข้อความล่าสุด เรียงจากเก่าไปใหม่ (ใช้เป็นบริบทให้ AI)
export async function recentMessages(conversationId: string, n: number): Promise<ChatMessage[]> {
  const r = await pool.query(
    `SELECT id, role, text, created_at FROM messages
     WHERE conversation_id = $1 ORDER BY id DESC LIMIT $2`,
    [conversationId, n],
  );
  return r.rows.map(toMessage).reverse();
}

// บันทึกคำถาม + คำตอบเป็นคู่ (สร้าง conversation ให้ถ้ายังไม่มี)
export async function addExchange(
  conversationId: string,
  userText: string,
  assistantText: string,
): Promise<[ChatMessage, ChatMessage]> {
  return withTransaction(async (db) => {
    await db.query(
      `INSERT INTO conversations (id) VALUES ($1)
       ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
      [conversationId],
    );
    const ins = `INSERT INTO messages (conversation_id, role, text)
                 VALUES ($1, $2, $3) RETURNING id, role, text, created_at`;
    const u = await db.query(ins, [conversationId, "user", userText]);
    const a = await db.query(ins, [conversationId, "assistant", assistantText]);
    return [toMessage(u.rows[0]), toMessage(a.rows[0])];
  });
}

export async function deleteConversation(id: string): Promise<boolean> {
  const r = await pool.query("DELETE FROM conversations WHERE id = $1", [id]);
  return (r.rowCount ?? 0) > 0;
}

export interface ConversationSummary {
  id: string;
  messageCount: number;
  firstQuestion: string | null;
  createdAt: string;
  updatedAt: string;
}

// สำหรับแอดมินดูภาพรวมประวัติแชตทั้งหมด
export async function listConversations(limit: number, offset: number): Promise<ConversationSummary[]> {
  const r = await pool.query(
    `SELECT c.id, c.created_at, c.updated_at,
            (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count,
            (SELECT text FROM messages m WHERE m.conversation_id = c.id AND m.role = 'user'
               ORDER BY m.id LIMIT 1) AS first_question
     FROM conversations c
     ORDER BY c.updated_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return r.rows.map((x) => ({
    id: x.id,
    messageCount: Number(x.message_count),
    firstQuestion: x.first_question,
    createdAt: new Date(x.created_at).toISOString(),
    updatedAt: new Date(x.updated_at).toISOString(),
  }));
}
