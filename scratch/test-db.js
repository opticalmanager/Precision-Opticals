const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Tables in database:", tables.rows.map(r => r.table_name));

    for (const t of ["products", "orders", "brands", "categories", "coupons", "admin_settings", "profiles", "appointments"]) {
      try {
        const c = await pool.query(`SELECT count(*) FROM public.${t}`);
        console.log(`Count for ${t}:`, c.rows[0].count);
      } catch (err) {
        console.log(`Table ${t} query error:`, err.message);
      }
    }

    const stats = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(id) as total_orders,
        COUNT(DISTINCT COALESCE(guest_email, guest_phone)) as total_customers,
        COALESCE(AVG(CASE WHEN payment_status = 'paid' THEN total_amount END), 0) as avg_order_value
      FROM public.orders;
    `);
    console.log("Stats (All time):", stats.rows[0]);

    const lenses = await pool.query(`
      SELECT 
        COALESCE(product_snapshot->>'lensType', 'frame-only') as lens_type,
        COUNT(*) as count
      FROM public.order_items
      GROUP BY lens_type;
    `);
    console.log("Lens breakdown:", lenses.rows);

  } catch (e) {
    console.error("Connection error:", e.message);
  } finally {
    await pool.end();
  }
})();
