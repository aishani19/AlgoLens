import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Set DATABASE_URL in server/.env");
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const sqlPath = path.join(__dirname, "..", "sql", "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Schema applied.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
