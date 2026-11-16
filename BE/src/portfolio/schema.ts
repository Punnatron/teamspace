import { z } from "zod";

// รูปแบบข้อมูล portfolio ที่ใช้ทั้งในไฟล์ seed/portfolio.json และ PUT /api/portfolio

const text = (max: number) => z.string().trim().max(max);
// รับเฉพาะ http/https — FE เอาค่านี้ไปใส่ใน href ถ้ายอมให้ javascript:... จะกลายเป็นช่อง XSS
const url = z
  .string()
  .trim()
  .max(500)
  .pipe(z.url({ protocol: /^https?$/, message: "ต้องเป็นลิงก์ที่ขึ้นต้นด้วย http:// หรือ https://" }))
  .nullish();

export const contactInput = z.object({
  type: text(30).min(1), // email, github, facebook, instagram, line, phone, website, ...
  label: text(100).default(""),
  value: text(300).min(1),
});

export const projectInput = z.object({
  title: text(200).min(1),
  description: text(3000).default(""),
  tech: z.array(text(50).min(1)).max(30).default([]),
  url,
});

export const memberInput = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "slug ใช้ได้แค่ a-z, 0-9 และ -"),
  name: text(200).min(1),
  nickname: text(100).default(""),
  role: text(200).min(1),
  bio: text(3000).default(""),
  skills: z.array(text(80).min(1)).max(50).default([]),
  avatarUrl: url,
  projects: z.array(projectInput).max(30).default([]),
  contacts: z.array(contactInput).max(20).default([]),
});

export const portfolioInput = z
  .object({
    group: z.object({
      name: text(200).min(1),
      tagline: text(300).default(""),
      concept: text(3000).default(""),
      highlights: z.array(text(300).min(1)).max(20).default([]),
    }),
    projects: z.array(projectInput).max(30).default([]),
    contacts: z.array(contactInput).max(20).default([]),
    members: z.array(memberInput).min(1).max(10),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>();
    v.members.forEach((m, i) => {
      if (seen.has(m.slug)) {
        ctx.addIssue({ code: "custom", path: ["members", i, "slug"], message: `slug ซ้ำ: ${m.slug}` });
      }
      seen.add(m.slug);
    });
  });

export type PortfolioInput = z.infer<typeof portfolioInput>;
export type ProjectInput = z.infer<typeof projectInput>;
export type ContactInput = z.infer<typeof contactInput>;
