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

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    const p = await pool.query("SELECT count(*) FROM public.products");
    const v = await pool.query("SELECT count(*) FROM public.product_variants");
    const img = await pool.query("SELECT count(*) FROM public.product_images");
    const b = await pool.query("SELECT count(*) FROM public.brands");
    console.log("PRODUCTS:", p.rows[0].count);
    console.log("VARIANTS:", v.rows[0].count);
    console.log("IMAGES:", img.rows[0].count);
    console.log("BRANDS:", b.rows[0].count);

    const sample = await pool.query("SELECT id, slug, name, source_url FROM public.products WHERE slug = 'do-7970542092534'");
    console.log("Vogue sample:", sample.rows);
    if (sample.rows.length > 0) {
      const prodId = sample.rows[0].id;
      const imgs = await pool.query("SELECT id, url, is_primary FROM public.product_images WHERE product_id = $1 LIMIT 5", [prodId]);
      console.log("Vogue images:", imgs.rows);
    }
  } catch (err) {
    console.error("DB check error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
