import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const method = searchParams.get("method") || "all";
    const status = searchParams.get("status") || "all";
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10)));

    const conditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (search) {
      conditions.push(`(
        o.order_number ILIKE $${pIdx} OR
        o.payment_id ILIKE $${pIdx} OR
        o.guest_email ILIKE $${pIdx} OR
        o.guest_phone ILIKE $${pIdx} OR
        o.shipping_address->>'fullName' ILIKE $${pIdx}
      )`);
      params.push(`%${search}%`);
      pIdx++;
    }

    if (method && method !== "all") {
      conditions.push(`o.payment_method = $${pIdx}`);
      params.push(method);
      pIdx++;
    }

    if (status && status !== "all") {
      conditions.push(`o.payment_status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 1. Fetch transactions
    const transactionsRes = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.payment_id,
        o.payment_method,
        o.payment_status,
        o.payment_details,
        o.total_amount,
        o.subtotal,
        o.discount_amount,
        o.shipping_fee,
        o.shipping_address,
        o.guest_email,
        o.guest_phone,
        o.created_at,
        o.status as order_status
       FROM public.orders o
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${pIdx};`,
      [...params, limit]
    );

    // 2. Compute aggregate financial KPIs
    const metricsRes = await query(`
      SELECT 
        COUNT(id) as total_tx_count,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_settled_volume,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_count,
        COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN payment_method IN ('upi', 'card', 'netbanking') THEN 1 END) as rzp_count,
        COALESCE(SUM(CASE WHEN payment_method IN ('upi', 'card', 'netbanking') AND payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as rzp_volume,
        COUNT(CASE WHEN payment_method = 'cod' THEN 1 END) as cod_count
      FROM public.orders;
    `);

    const metrics = metricsRes.rows[0] || {};
    const totalCount = parseInt(metrics.total_tx_count || "0", 10);
    const paidCount = parseInt(metrics.paid_count || "0", 10);
    const successRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 100;

    return NextResponse.json(
      {
        success: true,
        transactions: transactionsRes.rows,
        metrics: {
          totalSettledVolume: parseFloat(metrics.total_settled_volume || "0"),
          totalTransactions: totalCount,
          paidTransactions: paidCount,
          pendingTransactions: parseInt(metrics.unpaid_count || "0", 10),
          failedTransactions: parseInt(metrics.failed_count || "0", 10),
          razorpayVolume: parseFloat(metrics.rzp_volume || "0"),
          razorpayCount: parseInt(metrics.rzp_count || "0", 10),
          codCount: parseInt(metrics.cod_count || "0", 10),
          successRate,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[ADMIN-PAYMENTS] Transactions API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load payment transactions" },
      { status: 500 }
    );
  }
}
