import pg from "pg";

const connectionString = "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

const { Client } = pg;

async function seedOrders() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Connected to Supabase PostgreSQL. Seeding realistic optical orders...");

  // Check if orders already exist
  const existing = await client.query("SELECT count(*) FROM public.orders;");
  if (parseInt(existing.rows[0].count) > 0) {
    console.log(`Already have ${existing.rows[0].count} orders in database. Skipping seed.`);
    await client.end();
    return;
  }

  // Fetch product IDs
  const prods = await client.query("SELECT id, slug, name, base_price, specs FROM public.products;");
  const prodMap = new Map(prods.rows.map(p => [p.slug, p]));

  // Fetch lens packages
  const lenses = await client.query("SELECT id, name, price, lens_type FROM public.lens_packages;");
  const lensMap = new Map(lenses.rows.map(l => [l.lens_type, l]));

  const sampleOrders = [
    {
      order_number: "PO-914820",
      guest_email: "vikram.mehta@oberoigroup.com",
      guest_phone: "+91 98112 34567",
      status: "optician_assembly",
      payment_status: "paid",
      payment_method: "card",
      subtotal: 78500,
      discount_amount: 3000,
      coupon_code: "PRECISION10",
      shipping_fee: 0,
      total_amount: 84499, // frame + Zeiss lens - discount
      courier_partner: "BlueDart Express",
      tracking_number: "BLUEDART-PO-914820",
      shipping_address: {
        fullName: "Vikram Mehta",
        phone: "+91 98112 34567",
        email: "vikram.mehta@oberoigroup.com",
        streetAddress: "Penthouse 14B, The Magnolias, Golf Course Road",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002",
        country: "India"
      },
      item: {
        prod_slug: "cartier-premiere-ct0012o",
        lens_type: "progressive",
        lens_name: "Zeiss DriveSafe Precision Progressive",
        lens_price: 8999,
        color: "Yellow Gold",
        patient_rx: {
          rightEye: { sph: "-1.75", cyl: "-0.50", axis: "90", add: "+1.75" },
          leftEye: { sph: "-2.00", cyl: "-0.25", axis: "85", add: "+1.75" },
          pd: "64"
        }
      },
      days_ago: 1
    },
    {
      order_number: "PO-829104",
      guest_email: "ananya.sharma@deloitte.com",
      guest_phone: "+91 99201 88472",
      status: "quality_check",
      payment_status: "paid",
      payment_method: "upi",
      subtotal: 29900,
      discount_amount: 0,
      coupon_code: null,
      shipping_fee: 0,
      total_amount: 32899,
      courier_partner: "BlueDart Express",
      tracking_number: "BLUEDART-PO-829104",
      shipping_address: {
        fullName: "Ananya Sharma",
        phone: "+91 99201 88472",
        email: "ananya.sharma@deloitte.com",
        streetAddress: "Apt 902, Lodha Bellissimo, Mahalaxmi",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400011",
        country: "India"
      },
      item: {
        prod_slug: "ray-ban-meta-wayfarer-gen2",
        lens_type: "single-vision",
        lens_name: "Ultra-Thin 1.67 Blue-Cut Hi-Index",
        lens_price: 2999,
        color: "Matte Black",
        patient_rx: {
          rightEye: { sph: "-0.75", cyl: "-0.25", axis: "180" },
          leftEye: { sph: "-1.00", cyl: "0.00", axis: "0" },
          pd: "62"
        }
      },
      days_ago: 2
    },
    {
      order_number: "PO-753912",
      guest_email: "rohit.singhania@techcorp.in",
      guest_phone: "+91 98450 11928",
      status: "dispatched",
      payment_status: "paid",
      payment_method: "netbanking",
      subtotal: 52000,
      discount_amount: 2000,
      coupon_code: "LUXURY2026",
      shipping_fee: 0,
      total_amount: 54499,
      courier_partner: "Delhivery Air Express",
      tracking_number: "DLHV-PO-753912",
      shipping_address: {
        fullName: "Rohit Singhania",
        phone: "+91 98450 11928",
        email: "rohit.singhania@techcorp.in",
        streetAddress: "Villa 8, Epsilon Villas, Yemlur",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560037",
        country: "India"
      },
      item: {
        prod_slug: "lindberg-air-titanium-rim-morten",
        lens_type: "single-vision",
        lens_name: "Digital Freeform Corridor Progressive",
        lens_price: 4499,
        color: "Brushed Graphite Titanium",
        patient_rx: {
          rightEye: { sph: "-2.25", cyl: "-0.75", axis: "75", add: "+1.50" },
          leftEye: { sph: "-2.50", cyl: "-0.50", axis: "105", add: "+1.50" },
          pd: "63"
        }
      },
      days_ago: 3
    },
    {
      order_number: "PO-641098",
      guest_email: "priya.nair@apollo.org",
      guest_phone: "+91 97411 55291",
      status: "delivered",
      payment_status: "paid",
      payment_method: "card",
      subtotal: 87125,
      discount_amount: 3000,
      coupon_code: "PRECISION10",
      shipping_fee: 0,
      total_amount: 85424,
      courier_partner: "BlueDart Express",
      tracking_number: "BLUEDART-PO-641098",
      shipping_address: {
        fullName: "Dr. Priya Nair",
        phone: "+91 97411 55291",
        email: "priya.nair@apollo.org",
        streetAddress: "Flat 4A, Silver Cascade, Boat Club Road",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600028",
        country: "India"
      },
      item: {
        prod_slug: "figma-cartier-blue-rimless",
        lens_type: "zero-power-blue",
        lens_name: "Zero-Power Blue Defense",
        lens_price: 1299,
        color: "Burgundy Acetate",
        patient_rx: null
      },
      days_ago: 5
    },
    {
      order_number: "PO-518274",
      guest_email: "karan.kapoor@venturepartners.com",
      guest_phone: "+91 98200 44102",
      status: "confirmed",
      payment_status: "paid",
      payment_method: "upi",
      subtotal: 17900,
      discount_amount: 0,
      coupon_code: null,
      shipping_fee: 0,
      total_amount: 17900,
      courier_partner: "BlueDart Express",
      tracking_number: "BLUEDART-PO-518274",
      shipping_address: {
        fullName: "Karan Kapoor",
        phone: "+91 98200 44102",
        email: "karan.kapoor@venturepartners.com",
        streetAddress: "B-42, Defence Colony",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110024",
        country: "India"
      },
      item: {
        prod_slug: "gast-astro-as02-53",
        lens_type: "frame-only",
        lens_name: "Frame Only (Demo Lenses)",
        lens_price: 0,
        color: "Gold / Emerald Green",
        patient_rx: null
      },
      days_ago: 0
    },
    {
      order_number: "PO-409182",
      guest_email: "rajesh.verma@consultant.com",
      guest_phone: "+91 98180 99281",
      status: "confirmed",
      payment_status: "unpaid",
      payment_method: "cod",
      subtotal: 87125,
      discount_amount: 0,
      coupon_code: null,
      shipping_fee: 0,
      total_amount: 87125,
      courier_partner: "BlueDart Express",
      tracking_number: "BLUEDART-PO-409182",
      shipping_address: {
        fullName: "Rajesh Verma",
        phone: "+91 98180 99281",
        email: "rajesh.verma@consultant.com",
        streetAddress: "House 124, Sector 15A",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201301",
        country: "India"
      },
      item: {
        prod_slug: "figma-brown-gradient-rimless",
        lens_type: "frame-only",
        lens_name: "Frame Only (Demo Lenses)",
        lens_price: 0,
        color: "Blue Rectangle",
        patient_rx: null
      },
      days_ago: 0
    }
  ];

  for (const o of sampleOrders) {
    const createdAt = new Date(Date.now() - o.days_ago * 86400000);
    const estDelivery = new Date(createdAt.getTime() + 4 * 86400000);

    const orderRes = await client.query(
      `INSERT INTO public.orders (
        order_number, guest_email, guest_phone, status, payment_status, payment_method,
        subtotal, discount_amount, coupon_code, shipping_fee, total_amount,
        shipping_address, tracking_number, courier_partner, estimated_delivery, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id;`,
      [
        o.order_number, o.guest_email, o.guest_phone, o.status, o.payment_status, o.payment_method,
        o.subtotal, o.discount_amount, o.coupon_code, o.shipping_fee, o.total_amount,
        JSON.stringify(o.shipping_address), o.tracking_number, o.courier_partner,
        estDelivery.toISOString().split("T")[0], createdAt.toISOString()
      ]
    );

    const orderId = orderRes.rows[0].id;
    const prod = prodMap.get(o.item.prod_slug) || prods.rows[0];
    const lens = lensMap.get(o.item.lens_type);

    await client.query(
      `INSERT INTO public.order_items (
        order_id, product_id, lens_package_id, quantity, unit_price, lens_price, total_price, product_snapshot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        orderId,
        prod.id,
        lens?.id || null,
        1,
        o.subtotal,
        o.item.lens_price,
        o.total_amount,
        JSON.stringify({
          name: prod.name,
          color: o.item.color,
          lensType: o.item.lens_type,
          lensPackage: o.item.lens_name,
          prescription: o.item.patient_rx
        })
      ]
    );
  }

  console.log(`Successfully seeded ${sampleOrders.length} realistic optical orders with lab data!`);
  await client.end();
}

seedOrders().catch(e => {
  console.error("Order seed error:", e);
  process.exit(1);
});
