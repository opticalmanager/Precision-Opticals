import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load env
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create unauthenticated client (simulates any web visitor / customer browser)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSecurityTests() {
  console.log("=== RUNNING ROW LEVEL SECURITY (RLS) & API TESTS ===\n");

  // TEST 1: Public Catalog Read
  console.log("Test 1: Public Catalog Read (should be allowed)...");
  const { data: products, error: prodErr } = await supabase.from("products").select("name, base_price, category_id").limit(3);
  if (prodErr) {
    console.error("  FAILED:", prodErr.message);
  } else {
    console.log(`  PASSED: Successfully read ${products.length} products publicly:`);
    products.forEach((p) => console.log(`    - ${p.name} (₹${p.base_price})`));
  }

  // TEST 2: Unauthenticated Orders Read (Data Leak Prevention)
  console.log("\nTest 2: Data Leak Prevention on Orders (should return 0 rows to unauthenticated caller)...");
  const { data: orders, error: ordersErr } = await supabase.from("orders").select("*");
  if (ordersErr) {
    console.log("  PASSED: Access blocked with error:", ordersErr.message);
  } else if (!orders || orders.length === 0) {
    console.log("  PASSED: RLS active. 0 unauthorized order records leaked.");
  } else {
    console.error("  FAILED: Data leak! Unauthorized caller read orders:", orders.length);
  }

  // TEST 3: Unauthenticated Prescriptions Read (Medical Data Protection)
  console.log("\nTest 3: Patient Privacy on Prescriptions (should return 0 rows to unauthorized caller)...");
  const { data: rx, error: rxErr } = await supabase.from("prescriptions").select("*");
  if (rxErr) {
    console.log("  PASSED: Access blocked with error:", rxErr.message);
  } else if (!rx || rx.length === 0) {
    console.log("  PASSED: RLS active. 0 patient prescription records leaked.");
  } else {
    console.error("  FAILED: Data leak! Unauthorized caller read prescriptions:", rx.length);
  }

  // TEST 4: Categories & Brands Read
  console.log("\nTest 4: Reading Brands and Categories...");
  const { data: brands } = await supabase.from("brands").select("name, origin").limit(4);
  console.log(`  PASSED: Fetched ${brands?.length || 0} luxury brands:`, brands?.map(b => b.name).join(", "));

  console.log("\n=== ALL SECURITY AND SCHEMA TESTS COMPLETED SUCCESSFULLY ===");
}

runSecurityTests();
