import pg from "pg";

const connectionString = "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
const { Client } = pg;

async function setupSettings() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Connected to PostgreSQL. Creating admin_settings table if needed...");

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.admin_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const defaultSettings = [
    {
      key: "general",
      value: {
        storeName: "Precision Optics (Estd. 1969)",
        tagline: "Luxury Eyewear & Clinical Optometry Atelier",
        email: "concierge@precisionoptics.in",
        phone: "+91 98100 12345",
        currency: "INR (₹)",
        timezone: "Asia/Kolkata (IST)",
        operatingHours: "Monday - Sunday: 10:30 AM - 08:30 PM",
        address: "JMD Regent Arcade, Sector 104, Golf Course Road, Gurugram, Haryana - 122002"
      }
    },
    {
      key: "payments",
      value: {
        stripe: {
          enabled: true,
          mode: "live",
          publicKeyMasked: "pk_live_••••••••••••••••8912",
          acceptedMethods: ["Credit Cards", "Apple Pay", "Google Pay"]
        },
        razorpayUpi: {
          enabled: true,
          mode: "live",
          keyIdMasked: "rzp_live_••••••••••••••••4310",
          acceptedMethods: ["UPI", "GPay", "PhonePe", "Paytm", "NetBanking", "RuPay"]
        },
        cod: {
          enabled: true,
          minOrderValue: 2000,
          maxOrderValue: 50000,
          requiresPhoneVerification: true
        },
        netbanking: {
          enabled: true,
          supportedBanks: ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra"]
        }
      }
    },
    {
      key: "shipping",
      value: {
        freeShippingThreshold: 5000,
        standardShippingFee: 250,
        expressShippingFee: 490,
        defaultCarrier: "BlueDart Express",
        supportedCarriers: ["BlueDart Express", "Delhivery Air", "DHL International"],
        enableWhiteGloveHomeTrial: true,
        trialDepositAmount: 3000
      }
    },
    {
      key: "roles",
      value: [
        {
          id: "role-01",
          name: "Alexander Sterling",
          email: "a.sterling@precisionoptics.com",
          role: "Super Admin",
          status: "active",
          permissions: ["Full Access", "Product Catalog", "Order Fulfillment", "Financials & Payments", "Staff Management"]
        },
        {
          id: "role-02",
          name: "Dr. R. K. Malhotra",
          email: "malhotra.optometry@precisionoptics.com",
          role: "Master Optician & Lab Lead",
          status: "active",
          permissions: ["Optical Lab Assembly", "Quality Check", "Prescriptions", "Eye Exam Appointments"]
        },
        {
          id: "role-03",
          name: "Rhea Sen",
          email: "rhea.catalog@precisionoptics.com",
          role: "Catalog Manager",
          status: "active",
          permissions: ["Product Catalog", "Inventory Adjustments", "Brand Management", "Promotions & Discounts"]
        },
        {
          id: "role-04",
          name: "Devendra Verma",
          email: "d.verma@precisionoptics.com",
          role: "Order Fulfillment Manager",
          status: "active",
          permissions: ["Order Management", "Shipping & Dispatch", "Courier Integrations", "Customer Support"]
        }
      ]
    }
  ];

  for (const s of defaultSettings) {
    await client.query(`
      INSERT INTO public.admin_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) DO NOTHING;
    `, [s.key, JSON.stringify(s.value)]);
  }

  console.log("Admin settings table initialized with configuration data!");
  await client.end();
}

setupSettings().catch(e => {
  console.error("Setup settings error:", e);
  process.exit(1);
});
