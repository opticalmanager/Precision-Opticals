import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const isValidUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// GET /api/wishlist?userId=...&sessionId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get("userId");
    const rawSessionId = searchParams.get("sessionId");

    const validUserId = isValidUUID(rawUserId) ? rawUserId : null;
    const effectiveSessionId = !validUserId ? (rawUserId || rawSessionId) : rawSessionId;

    if (!validUserId && !effectiveSessionId) {
      return NextResponse.json({ wishlistIds: [], items: [] });
    }

    let query = supabase
      .from("wishlist_items")
      .select("id, product_id, user_id, session_id, created_at")
      .order("created_at", { ascending: false });

    if (validUserId) {
      query = query.eq("user_id", validUserId);
    } else if (effectiveSessionId) {
      query = query.eq("session_id", effectiveSessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Error fetching wishlist:", error.message);
      return NextResponse.json({ wishlistIds: [], items: [] });
    }

    const wishlistIds = (data || []).map((row: any) => row.product_id);
    return NextResponse.json({ wishlistIds, items: data || [] });
  } catch (err: any) {
    console.error("GET /api/wishlist error:", err);
    return NextResponse.json({ error: err.message, wishlistIds: [] }, { status: 500 });
  }
}

// POST /api/wishlist
// Body: { action: 'toggle' | 'add' | 'sync', productId?: string, userId?: string, sessionId?: string, localIds?: string[] }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "toggle", productId, userId: rawUserId, sessionId: rawSessionId, localIds } = body;

    const validUserId = isValidUUID(rawUserId) ? rawUserId : null;
    const effectiveSessionId = !validUserId ? (rawUserId || rawSessionId) : rawSessionId;

    if (!validUserId && !effectiveSessionId) {
      return NextResponse.json({ error: "userId or sessionId is required" }, { status: 400 });
    }

    // Action 1: Batch sync local storage wishlist to DB
    if (action === "sync" && Array.isArray(localIds) && localIds.length > 0) {
      // Find what already exists to prevent duplicate inserts
      let checkQuery = supabase.from("wishlist_items").select("product_id");
      if (validUserId) checkQuery = checkQuery.eq("user_id", validUserId);
      else checkQuery = checkQuery.eq("session_id", effectiveSessionId);

      const { data: existingRows } = await checkQuery;
      const existingSet = new Set((existingRows || []).map((r: any) => r.product_id));

      const newIdsToInsert = localIds.filter((pid: string) => !existingSet.has(pid));

      if (newIdsToInsert.length > 0) {
        const recordsToInsert = newIdsToInsert.map((pid: string) => ({
          user_id: validUserId || null,
          session_id: validUserId ? null : effectiveSessionId,
          product_id: pid,
        }));

        const { error: insertErr } = await supabase
          .from("wishlist_items")
          .insert(recordsToInsert);

        if (insertErr) {
          console.warn("Wishlist sync insert warning:", insertErr.message);
        }
      }

      // Return refreshed wishlist IDs
      let refreshQuery = supabase.from("wishlist_items").select("product_id");
      if (validUserId) refreshQuery = refreshQuery.eq("user_id", validUserId);
      else refreshQuery = refreshQuery.eq("session_id", effectiveSessionId);

      const { data: refreshed } = await refreshQuery;
      const wishlistIds = (refreshed || []).map((r: any) => r.product_id);

      return NextResponse.json({ success: true, wishlistIds });
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Action 2: Add single product
    if (action === "add") {
      let checkQuery = supabase
        .from("wishlist_items")
        .select("id")
        .eq("product_id", productId);

      if (validUserId) checkQuery = checkQuery.eq("user_id", validUserId);
      else checkQuery = checkQuery.eq("session_id", effectiveSessionId);

      const { data: existing } = await checkQuery;

      if (!existing || existing.length === 0) {
        await supabase.from("wishlist_items").insert({
          user_id: validUserId || null,
          session_id: validUserId ? null : effectiveSessionId,
          product_id: productId,
        });
      }

      return NextResponse.json({ success: true, isWishlisted: true });
    }

    // Action 3: Toggle product (add if not exists, remove if exists)
    let checkQuery = supabase
      .from("wishlist_items")
      .select("id")
      .eq("product_id", productId);

    if (validUserId) checkQuery = checkQuery.eq("user_id", validUserId);
    else checkQuery = checkQuery.eq("session_id", effectiveSessionId);

    const { data: existing } = await checkQuery;

    if (existing && existing.length > 0) {
      // Remove
      let deleteQuery = supabase
        .from("wishlist_items")
        .delete()
        .eq("product_id", productId);

      if (validUserId) deleteQuery = deleteQuery.eq("user_id", validUserId);
      else deleteQuery = deleteQuery.eq("session_id", effectiveSessionId);

      await deleteQuery;
      return NextResponse.json({ success: true, isWishlisted: false, action: "removed" });
    } else {
      // Add
      await supabase
        .from("wishlist_items")
        .insert({
          user_id: validUserId || null,
          session_id: validUserId ? null : effectiveSessionId,
          product_id: productId,
        });

      return NextResponse.json({ success: true, isWishlisted: true, action: "added" });
    }
  } catch (err: any) {
    console.error("POST /api/wishlist error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/wishlist
// Query or Body: { productId?: string, userId?: string, sessionId?: string, clearAll?: boolean }
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId");
    let userId = searchParams.get("userId");
    let sessionId = searchParams.get("sessionId");
    let clearAll = searchParams.get("clearAll") === "true";

    if (!productId && !clearAll) {
      try {
        const body = await req.json();
        productId = body.productId;
        userId = body.userId || userId;
        sessionId = body.sessionId || sessionId;
        clearAll = body.clearAll || clearAll;
      } catch {
        // No body provided
      }
    }

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "userId or sessionId required" }, { status: 400 });
    }

    let deleteQuery = supabase.from("wishlist_items").delete();

    if (userId) deleteQuery = deleteQuery.eq("user_id", userId);
    else deleteQuery = deleteQuery.eq("session_id", sessionId);

    if (!clearAll && productId) {
      deleteQuery = deleteQuery.eq("product_id", productId);
    }

    const { error } = await deleteQuery;
    if (error) {
      console.warn("Wishlist delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/wishlist error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
