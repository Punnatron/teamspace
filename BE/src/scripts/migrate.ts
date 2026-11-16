import { runMigrations } from "../db/migrations";
import { pool } from "../db/pool";

runMigrations()
  .then((applied) => console.log(applied.length ? `รัน ${applied.length} migration แล้ว` : "schema เป็นปัจจุบันแล้ว"))
  .catch((err) => {
    console.error("migration ล้มเหลว:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
