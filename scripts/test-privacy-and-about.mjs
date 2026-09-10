import pg from "pg";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL.");

  // Test insert
  const res = await client.query(
    `INSERT INTO public.privacy_requests (request_type, full_name, email, phone, details, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, request_type, full_name, email, status, created_at;`,
    ["access_data", "Gaurav Test Client", "test@precisionoptics.in", "+919999899998", "Export optical history", "pending"]
  );
  console.log("Privacy Request Inserted:", res.rows[0]);

  // Test count
  const count = await client.query("SELECT count(*) FROM public.privacy_requests;");
  console.log("Total privacy requests in DB:", count.rows[0].count);

  // Clean up
  await client.query("DELETE FROM public.privacy_requests WHERE email = $1;", ["test@precisionoptics.in"]);
  console.log("Cleaned up test row.");

  // Verify Cloudflare R2 assets
  const r2Images = [
    "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/about/about_brand_typewriter.png",
    "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/about/about_quality_robot.png",
    "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/about/about_variety_stack.png",
    "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/about/about_value_atelier.png",
  ];

  for (const url of r2Images) {
    const headRes = await fetch(url, { method: "HEAD" });
    console.log(`R2 Asset ${url.split("/").pop()} status: ${headRes.status}`);
  }

  await client.end();
  console.log("Verification complete!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
