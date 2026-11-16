import { createApp } from "./app";
import { config } from "./config";
import { runMigrations } from "./db/migrations";
import { pool } from "./db/pool";
import { hasPortfolio } from "./portfolio/repository";
import { seedFromFile } from "./portfolio/seed";

async function main() {
  if (config.autoMigrate) await runMigrations();
  if (config.seedMode === "always" || (config.seedMode === "if-empty" && !(await hasPortfolio()))) {
    const data = await seedFromFile();
    console.log(`โหลดข้อมูล portfolio จาก ${config.seedFile}: ${data.members.length} สมาชิก`);
  }

  const server = createApp().listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  // ปิดอย่างนุ่มนวลตอน platform สั่งหยุด (เช่นตอน deploy เวอร์ชันใหม่)
  const shutdown = () => {
    server.close(() => pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  // ต่อ localhost ไม่ได้ Node จะรวม error ของ IPv6/IPv4 ไว้ใน AggregateError
  const msg = err instanceof AggregateError ? err.errors.map((e) => e?.message ?? e).join(", ") : err?.message;
  console.error("เปิด server ไม่สำเร็จ (ตรวจ DATABASE_URL / seed/portfolio.json):", msg);
  process.exit(1);
});
