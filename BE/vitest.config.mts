import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // ทุกไฟล์ทดสอบใช้ฐานข้อมูลเดียวกัน จึงรันทีละไฟล์
    fileParallelism: false,
    testTimeout: 15_000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        "postgres://chat:chat@localhost:5432/chat_test",
      // ทดสอบโดยไม่เรียก AI จริง (ใช้ LLM ปลอมหรือโหมดออฟไลน์)
      LLM_API_KEY: "",
      ADMIN_TOKEN: "",
    },
  },
});
