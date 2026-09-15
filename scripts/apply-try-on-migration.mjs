import pg from "pg";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const { Client } = pg;

async function runTryOnMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    const migrationPath = path.join(process.cwd(), "supabase", "migrations", "04_try_on_schema.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("Executing 04_try_on_schema.sql...");
    await client.query(sql);
    console.log("Migration executed successfully!");

    const colRes = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name LIKE 'try_on%'
      ORDER BY column_name;
    `);

    console.log("\nVerified Try-On columns in 'products' table:");
    console.table(colRes.rows);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runTryOnMigration();
