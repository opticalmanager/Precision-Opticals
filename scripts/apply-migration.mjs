import pg from "pg";
import fs from "fs";
import path from "path";

// Simple env file parser without external dependency
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

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("Connecting to Supabase PostgreSQL database...");
  
  // Create client with SSL
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully to Supabase database!");

    const migrationPath = path.join(process.cwd(), "supabase", "migrations", "01_initial_schema.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("Executing 01_initial_schema.sql migration...");
    await client.query(sql);
    console.log("Migration executed successfully!");

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\nVerified Tables in 'public' schema:");
    res.rows.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.table_name}`);
    });

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
