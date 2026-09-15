import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    let searchCondition = "";
    const params: any[] = [];
    if (search) {
      searchCondition = `WHERE (
        c.full_name ILIKE $1 OR 
        c.email ILIKE $1 OR 
        c.phone ILIKE $1 OR 
        c.city ILIKE $1
      )`;
      params.push(`%${search}%`);
    }

    const customersRes = await query(`
      WITH customer_aggregates AS (
        SELECT 
          COALESCE(o.shipping_address->>'fullName', 'Valued Patron') as full_name,
          o.guest_email as email,
          o.guest_phone as phone,
          o.shipping_address->>'city' as city,
          o.shipping_address->>'state' as state,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_spent,
          MAX(o.created_at) as last_order_date,
          COALESCE(
            BOOL_OR(EXISTS (
              SELECT 1 FROM public.order_items oi 
              WHERE oi.order_id = o.id AND oi.product_snapshot->'prescription' IS NOT NULL
            )), 
            false
          ) as has_prescription_on_file,
          json_agg(json_build_object(
            'id', o.id,
            'order_number', o.order_number,
            'total_amount', o.total_amount,
            'status', o.status,
            'payment_status', o.payment_status,
            'created_at', o.created_at
          ) ORDER BY o.created_at DESC) as orders_list,
          (
            SELECT oi.product_snapshot->'prescription'
            FROM public.order_items oi
            JOIN public.orders o2 ON o2.id = oi.order_id
            WHERE o2.guest_email = o.guest_email AND oi.product_snapshot->'prescription' IS NOT NULL
            LIMIT 1
          ) as latest_rx
        FROM public.orders o
        GROUP BY 
          COALESCE(o.shipping_address->>'fullName', 'Valued Patron'),
          o.guest_email,
          o.guest_phone,
          o.shipping_address->>'city',
          o.shipping_address->>'state'
      )
      SELECT c.* 
      FROM customer_aggregates c
      ${searchCondition}
      ORDER BY c.total_spent DESC, c.total_orders DESC;
    `, params);

    const statsRes = await query(`
      SELECT 
        COUNT(DISTINCT guest_email) as total_customers,
        COALESCE(SUM(total_amount), 0) as cumulative_ltv,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM public.orders;
    `);

    return NextResponse.json({
      success: true,
      customers: customersRes.rows,
      stats: {
        totalCustomers: parseInt(statsRes.rows[0]?.total_customers || "0", 10),
        cumulativeLtv: Number(statsRes.rows[0]?.cumulative_ltv || 0),
        avgOrderValue: Math.round(Number(statsRes.rows[0]?.avg_order_value || 0)),
      },
    });
  } catch (error: any) {
    console.error("Customers GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load customers" },
      { status: 500 }
    );
  }
}
