import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sqlPath = path.join(process.cwd(), "neon/02_users_table.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    console.log("Executing SQL migration...", sqlPath);
    await pool.query(sql);
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
