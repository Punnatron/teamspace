import { readFileSync } from "node:fs";
import path from "node:path";
import { runMigrations } from "../src/db/migrations";
import { pool } from "../src/db/pool";
import { savePortfolio } from "../src/portfolio/repository";
import { portfolioInput, type PortfolioInput } from "../src/portfolio/schema";

export const fixture: PortfolioInput = portfolioInput.parse({
  group: {
    name: "Team Byte",
    tagline: "เขียนโค้ดให้หุ่นยนต์ยิ้มได้",
    concept: "ทีมที่รวมสาย Web กับ Robotics",
    highlights: ["deploy อัตโนมัติ"],
  },
  projects: [{ title: "Chat Portfolio", description: "เว็บกลุ่ม", tech: ["React", "Express"] }],
  contacts: [{ type: "email", label: "อีเมลกลุ่ม", value: "team@example.com" }],
  members: [
    {
      slug: "alice",
      name: "Alice Wong",
      nickname: "อลิซ",
      role: "Backend Developer",
      skills: ["Node.js", "PostgreSQL"],
      projects: [{ title: "Queue Robot", description: "หุ่นยนต์ออกบัตรคิว", tech: ["ROS2"] }],
      contacts: [{ type: "github", value: "https://github.com/alice" }],
    },
    {
      slug: "bob",
      name: "Bob Lee",
      nickname: "บ็อบ",
      role: "Frontend Developer",
      skills: ["React"],
    },
  ],
});

export async function resetDb(data: PortfolioInput | null = fixture) {
  await runMigrations(false);
  await pool.query("TRUNCATE messages, conversations, projects, contacts, members, group_info RESTART IDENTITY CASCADE");
  if (data) await savePortfolio(data);
}

export function realSeed(): unknown {
  return JSON.parse(readFileSync(path.join(__dirname, "..", "seed", "portfolio.json"), "utf8"));
}
