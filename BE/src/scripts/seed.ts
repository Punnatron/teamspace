import { runMigrations } from "../db/migrations";
import { pool } from "../db/pool";
import { seedFromFile } from "../portfolio/seed";

// แก้ข้อมูลใน seed/portfolio.json แล้วรัน: npm run seed (รันซ้ำได้ ข้อมูล portfolio เดิมจะถูกแทนที่ ประวัติแชตไม่หาย)
(async () => {
  try {
    await runMigrations();
    const data = await seedFromFile(process.argv[2]);
    console.log(`บันทึกแล้ว: กลุ่ม "${data.group.name}" + สมาชิก ${data.members.length} คน`);
  } catch (err) {
    const e = err as Error & { issues?: unknown };
    console.error("seed ล้มเหลว:", e.issues ? JSON.stringify(e.issues, null, 2) : e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
