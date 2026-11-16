import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler, notFound } from "./http/errors";
import { apiRouter, type RouteOptions } from "./http/routes";

export function createApp(opts: RouteOptions = {}) {
  const app = express();

  // อยู่หลัง proxy (Render + nginx ของ FE): ให้ rate limit เห็น IP จริงของผู้ใช้ ไม่ใช่ IP ของ nginx
  app.set("trust proxy", opts.trustProxy ?? config.trustProxy);
  app.disable("x-powered-by");

  const origins = config.corsOrigins;
  app.use(cors({ origin: origins.includes("*") ? true : origins }));
  app.use(express.json({ limit: "200kb" }));

  // log ทุก request (ดูได้ใน Logs ของ Render) — ไม่ log เนื้อหาข้อความ เพื่อความเป็นส่วนตัวของผู้ใช้
  if (config.nodeEnv !== "test") {
    app.use((req, res, next) => {
      const start = performance.now();
      res.on("finish", () => {
        const ms = Math.round(performance.now() - start);
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
      });
      next();
    });
  }

  app.get("/", (_req, res) => {
    res.json({ name: "Portfolio Chat API", docs: "ดู README.md", health: "/api/health" });
  });

  app.use("/api", apiRouter(opts));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
