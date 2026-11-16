import { pool } from "./pool";

// migration แต่ละตัวรันครั้งเดียว (จำไว้ในตาราง schema_migrations)
// ห้ามแก้ migration ที่ deploy ไปแล้ว — ถ้าจะเปลี่ยน schema ให้เพิ่มตัวใหม่ต่อท้าย
export const migrations: { name: string; sql: string }[] = [
  {
    name: "001_init",
    sql: `
      -- ข้อมูลกลุ่ม (มีแถวเดียวเสมอ)
      CREATE TABLE group_info (
        id          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        name        TEXT NOT NULL,
        tagline     TEXT NOT NULL DEFAULT '',
        concept     TEXT NOT NULL DEFAULT '',
        highlights  TEXT[] NOT NULL DEFAULT '{}',
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- สมาชิกรายบุคคล
      CREATE TABLE members (
        id          SERIAL PRIMARY KEY,
        slug        TEXT NOT NULL UNIQUE,
        name        TEXT NOT NULL,
        nickname    TEXT NOT NULL DEFAULT '',
        role        TEXT NOT NULL,
        bio         TEXT NOT NULL DEFAULT '',
        skills      TEXT[] NOT NULL DEFAULT '{}',
        avatar_url  TEXT,
        sort_order  INT NOT NULL DEFAULT 0
      );

      -- ผลงาน: member_id = NULL คือผลงานของกลุ่ม, มีค่า = ผลงานส่วนตัวของสมาชิก
      CREATE TABLE projects (
        id          SERIAL PRIMARY KEY,
        member_id   INT REFERENCES members(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        tech        TEXT[] NOT NULL DEFAULT '{}',
        url         TEXT,
        sort_order  INT NOT NULL DEFAULT 0
      );
      CREATE INDEX projects_member_idx ON projects (member_id);

      -- ช่องทางติดต่อ: member_id = NULL คือช่องทางของกลุ่ม
      CREATE TABLE contacts (
        id          SERIAL PRIMARY KEY,
        member_id   INT REFERENCES members(id) ON DELETE CASCADE,
        type        TEXT NOT NULL,
        label       TEXT NOT NULL DEFAULT '',
        value       TEXT NOT NULL,
        sort_order  INT NOT NULL DEFAULT 0
      );
      CREATE INDEX contacts_member_idx ON contacts (member_id);

      -- ประวัติการสนทนา: 1 conversation = 1 ผู้เยี่ยมชม (FE เก็บ id ไว้ใน localStorage)
      CREATE TABLE conversations (
        id          UUID PRIMARY KEY,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE messages (
        id               BIGSERIAL PRIMARY KEY,
        conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        text             TEXT NOT NULL,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX messages_conversation_idx ON messages (conversation_id, id);
    `,
  },
];

export async function runMigrations(log = true): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name        TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  const { rows } = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
  const done = new Set(rows.map((r) => r.name));
  const applied: string[] = [];

  for (const m of migrations) {
    if (done.has(m.name)) continue;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // กันกรณีหลาย instance เปิดพร้อมกันแล้วรัน migration ซ้ำ
      await client.query("SELECT pg_advisory_xact_lock(727274)");
      const again = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [m.name]);
      if (again.rowCount === 0) {
        await client.query(m.sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [m.name]);
        applied.push(m.name);
        if (log) console.log(`✔ migration ${m.name}`);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  return applied;
}
