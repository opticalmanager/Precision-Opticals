import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const sql = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/03_privacy_and_enquiries.sql"), "utf-8");
  await client.query(sql);
  console.log("03_privacy_and_enquiries.sql applied successfully!");
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'privacy_requests';");
  console.log("Verified table:", res.rows);
  await client.end();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
