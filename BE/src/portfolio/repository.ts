import type { PoolClient } from "pg";
import { pool, withTransaction } from "../db/pool";
import type { ContactInput, PortfolioInput, ProjectInput } from "./schema";

export interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  url: string | null;
}

export interface Contact {
  id: number;
  type: string;
  label: string;
  value: string;
}

export interface Member {
  id: number;
  slug: string;
  name: string;
  nickname: string;
  role: string;
  bio: string;
  skills: string[];
  avatarUrl: string | null;
  projects: Project[];
  contacts: Contact[];
}

export interface GroupInfo {
  name: string;
  tagline: string;
  concept: string;
  highlights: string[];
  updatedAt: string;
}

export interface Portfolio {
  group: GroupInfo;
  projects: Project[]; // ผลงานของกลุ่ม
  contacts: Contact[]; // ช่องทางติดต่อของกลุ่ม
  members: Member[];
}

type Row = Record<string, any>;

const toProject = (r: Row): Project => ({
  id: r.id,
  title: r.title,
  description: r.description,
  tech: r.tech,
  url: r.url,
});

const toContact = (r: Row): Contact => ({
  id: r.id,
  type: r.type,
  label: r.label,
  value: r.value,
});

// อ่าน portfolio ทั้งหมด (คืน null ถ้ายังไม่เคยใส่ข้อมูล)
export async function getPortfolio(): Promise<Portfolio | null> {
  const [g, m, p, c] = await Promise.all([
    pool.query("SELECT name, tagline, concept, highlights, updated_at FROM group_info WHERE id = 1"),
    pool.query(
      "SELECT id, slug, name, nickname, role, bio, skills, avatar_url FROM members ORDER BY sort_order, id",
    ),
    pool.query(
      "SELECT id, member_id, title, description, tech, url FROM projects ORDER BY sort_order, id",
    ),
    pool.query("SELECT id, member_id, type, label, value FROM contacts ORDER BY sort_order, id"),
  ]);
  if (g.rowCount === 0) return null;

  const gr = g.rows[0];
  const members: Member[] = m.rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    nickname: r.nickname,
    role: r.role,
    bio: r.bio,
    skills: r.skills,
    avatarUrl: r.avatar_url,
    projects: p.rows.filter((x) => x.member_id === r.id).map(toProject),
    contacts: c.rows.filter((x) => x.member_id === r.id).map(toContact),
  }));

  return {
    group: {
      name: gr.name,
      tagline: gr.tagline,
      concept: gr.concept,
      highlights: gr.highlights,
      updatedAt: new Date(gr.updated_at).toISOString(),
    },
    projects: p.rows.filter((x) => x.member_id === null).map(toProject),
    contacts: c.rows.filter((x) => x.member_id === null).map(toContact),
    members,
  };
}

export async function hasPortfolio(): Promise<boolean> {
  const r = await pool.query("SELECT 1 FROM group_info WHERE id = 1");
  return (r.rowCount ?? 0) > 0;
}

async function insertProjects(db: PoolClient, memberId: number | null, items: ProjectInput[]) {
  for (const [i, p] of items.entries()) {
    await db.query(
      "INSERT INTO projects (member_id, title, description, tech, url, sort_order) VALUES ($1,$2,$3,$4,$5,$6)",
      [memberId, p.title, p.description, p.tech, p.url ?? null, i],
    );
  }
}

async function insertContacts(db: PoolClient, memberId: number | null, items: ContactInput[]) {
  for (const [i, c] of items.entries()) {
    await db.query(
      "INSERT INTO contacts (member_id, type, label, value, sort_order) VALUES ($1,$2,$3,$4,$5)",
      [memberId, c.type, c.label, c.value, i],
    );
  }
}

// บันทึก portfolio ทั้งชุด (แทนที่ของเดิมทั้งหมด) ใน transaction เดียว — ไม่แตะประวัติแชต
export async function savePortfolio(data: PortfolioInput): Promise<void> {
  await withTransaction(async (db) => {
    await db.query("DELETE FROM projects");
    await db.query("DELETE FROM contacts");
    await db.query("DELETE FROM members");
    await db.query(
      `INSERT INTO group_info (id, name, tagline, concept, highlights, updated_at)
       VALUES (1, $1, $2, $3, $4, now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, tagline = EXCLUDED.tagline, concept = EXCLUDED.concept,
         highlights = EXCLUDED.highlights, updated_at = now()`,
      [data.group.name, data.group.tagline, data.group.concept, data.group.highlights],
    );
    await insertProjects(db, null, data.projects);
    await insertContacts(db, null, data.contacts);

    for (const [i, m] of data.members.entries()) {
      const r = await db.query(
        `INSERT INTO members (slug, name, nickname, role, bio, skills, avatar_url, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [m.slug, m.name, m.nickname, m.role, m.bio, m.skills, m.avatarUrl ?? null, i],
      );
      const memberId: number = r.rows[0].id;
      await insertProjects(db, memberId, m.projects);
      await insertContacts(db, memberId, m.contacts);
    }
  });
}
