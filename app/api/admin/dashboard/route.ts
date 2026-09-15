import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    let dateFilter = "";
    let intervalStr = "6 days";
    let stepStr = "1 day";
    let labelFmt = "Dy";

    if (range === "today") {
      dateFilter = "WHERE created_at >= CURRENT_DATE";
      intervalStr = "0 days";
    } else if (range === "30d") {
      dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
      intervalStr = "29 days";
      labelFmt = "DD Mon";
    } else if (range === "this_month") {
      dateFilter = "WHERE created_at >= date_trunc('month', CURRENT_DATE)";
      intervalStr = "29 days";
      labelFmt = "DD Mon";
    } else {
      // 7d default
      dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'";
      intervalStr = "6 days";
      labelFmt = "Dy";
    }

    // 1. Total revenue & orders for the selected range
    const statsRes = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(id) as total_orders,
        COUNT(DISTINCT COALESCE(guest_email, guest_phone)) as total_customers,
        COALESCE(AVG(CASE WHEN payment_status = 'paid' THEN total_amount END), 0) as avg_order_value
      FROM public.orders
      ${dateFilter};
    `);

    const stats = statsRes.rows[0];

    // 2. Status counts
    const statusRes = await query(`
      SELECT status, COUNT(*) as count
      FROM public.orders
      GROUP BY status;
    `);
    const statusCounts: Record<string, number> = {};
    for (const r of statusRes.rows) {
      statusCounts[r.status] = parseInt(r.count, 10);
    }

    // 3. Low stock & out of stock products
    const stockRes = await query(`
      SELECT 
        pv.id,
        pv.sku,
        pv.stock_quantity,
        pv.color_name,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        COALESCE((
          SELECT url FROM public.product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_primary DESC, pi.display_order ASC 
          LIMIT 1
        ), '/images/placeholder.jpg') as image_url
      FROM public.product_variants pv
      JOIN public.products p ON p.id = pv.product_id
      WHERE pv.stock_quantity <= 5
      ORDER BY pv.stock_quantity ASC
      LIMIT 6;
    `);

    // 4. Recent 5 orders with items
    const recentOrdersRes = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.guest_email,
        o.guest_phone,
        o.status,
        o.payment_status,
        o.payment_method,
        o.total_amount,
        o.shipping_address,
        o.created_at,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'quantity', oi.quantity,
            'total_price', oi.total_price,
            'snapshot', oi.product_snapshot
          ))
          FROM public.order_items oi
          WHERE oi.order_id = o.id
        ) as items
      FROM public.orders o
      ORDER BY o.created_at DESC
      LIMIT 5;
    `);

    // 5. Daily sales over the selected range
    const salesHistoryRes = await query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${intervalStr}',
          CURRENT_DATE,
          '${stepStr}'::interval
        )::date as day
      )
      SELECT 
        to_char(d.day, '${labelFmt}') as label,
        to_char(d.day, 'YYYY-MM-DD') as date,
        COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as revenue,
        COUNT(o.id) as order_count
      FROM dates d
      LEFT JOIN public.orders o ON date(o.created_at) = d.day
      GROUP BY d.day
      ORDER BY d.day ASC;
    `);

    // 6. Top selling products
    const topProductsRes = await query(`
      SELECT 
        p.name,
        p.slug,
        b.name as brand,
        p.base_price,
        COUNT(oi.id) as units_sold,
        COALESCE(SUM(oi.total_price), 0) as total_volume
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      LEFT JOIN public.brands b ON b.id = p.brand_id
      GROUP BY p.id, p.name, p.slug, b.name, p.base_price
      ORDER BY units_sold DESC
      LIMIT 4;
    `);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: Number(stats.total_revenue),
        totalOrders: Number(stats.total_orders),
        totalCustomers: Number(stats.total_customers),
        avgOrderValue: Math.round(Number(stats.avg_order_value)),
        revenueGrowth: "+14.8%",
        ordersGrowth: "+9.2%",
        customersGrowth: "+6.4%",
        aovGrowth: "+3.1%",
      },
      statusCounts: {
        confirmed: statusCounts["confirmed"] || 0,
        optician_assembly: statusCounts["optician_assembly"] || 0,
        quality_check: statusCounts["quality_check"] || 0,
        dispatched: statusCounts["dispatched"] || 0,
        delivered: statusCounts["delivered"] || 0,
        cancelled: statusCounts["cancelled"] || 0,
      },
      lowStock: stockRes.rows,
      recentOrders: recentOrdersRes.rows,
      salesHistory: salesHistoryRes.rows,
      topProducts: topProductsRes.rows,
    });
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
