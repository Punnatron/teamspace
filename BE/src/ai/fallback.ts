import type { Portfolio } from "../portfolio/repository";

// คำตอบสำรองตอนยังไม่ได้ตั้ง LLM_API_KEY: ยังอิงข้อมูล portfolio จริง (แต่ฉลาดน้อยกว่า AI มาก)
export function offlineReply(message: string, p: Portfolio | null): string {
  if (!p) return "(โหมดออฟไลน์) ยังไม่มีข้อมูล portfolio ในระบบ";
  const q = message.toLowerCase();

  const member = p.members.find((m) =>
    [m.name, m.nickname, m.slug, ...m.name.split(/\s+/)]
      .filter((s) => s && s.length >= 2)
      .some((s) => q.includes(s.toLowerCase())),
  );
  if (member) {
    const projects = member.projects.map((x) => x.title).join(", ") || "-";
    return (
      `(โหมดออฟไลน์) ${member.name}${member.nickname ? ` (${member.nickname})` : ""} ` +
      `รับบทบาท ${member.role} ทักษะ: ${member.skills.join(", ") || "-"} ผลงาน: ${projects}`
    );
  }

  if (/ติดต่อ|contact|อีเมล|email/.test(q) && p.contacts.length) {
    return `(โหมดออฟไลน์) ติดต่อกลุ่ม ${p.group.name} ได้ที่ ${p.contacts
      .map((c) => `${c.label || c.type}: ${c.value}`)
      .join(", ")}`;
  }

  return (
    `(โหมดออฟไลน์) กลุ่ม ${p.group.name} มีสมาชิก ${p.members.length} คน: ` +
    `${p.members.map((m) => `${m.nickname || m.name} (${m.role})`).join(", ")} ` +
    `ลองถามชื่อสมาชิกที่สนใจได้เลย`
  );
}
