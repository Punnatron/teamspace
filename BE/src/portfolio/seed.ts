import { readFileSync } from "node:fs";
import path from "node:path";
import { config } from "../config";
import { savePortfolio } from "./repository";
import { portfolioInput } from "./schema";

// อ่าน + ตรวจรูปแบบไฟล์ seed/portfolio.json แล้วบันทึกลงฐานข้อมูล
export async function seedFromFile(file = config.seedFile) {
  const full = path.resolve(process.cwd(), file);
  const data = portfolioInput.parse(JSON.parse(readFileSync(full, "utf8")));
  await savePortfolio(data);
  return data;
}
