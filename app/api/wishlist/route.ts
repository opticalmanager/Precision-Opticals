import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/wishlist?userId=...&sessionId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json({ wishlistIds: [], items: [] });
    }

    let query = supabase
      .from("wishlist_items")
      .select("id, product_id, user_id, session_id, created_at")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
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
    const { action = "toggle", productId, userId, sessionId, localIds } = body;

    if (!userId && !sessionId) {
      return NextResponse.json({ error: "userId or sessionId is required" }, { status: 400 });
    }

    // Action 1: Batch sync local storage wishlist to DB
    if (action === "sync" && Array.isArray(localIds) && localIds.length > 0) {
      const recordsToInsert = localIds.map((pid: string) => ({
        user_id: userId || null,
        session_id: userId ? null : sessionId,
        product_id: pid,
      }));

      const { error } = await supabase
        .from("wishlist_items")
        .upsert(recordsToInsert, {
          onConflict: userId ? "user_id,product_id" : "session_id,product_id",
          ignoreDuplicates: true,
        });

      if (error) {
        console.warn("Wishlist sync warning:", error.message);
      }

      // Return current refreshed list
      let refreshQuery = supabase.from("wishlist_items").select("product_id");
      if (userId) refreshQuery = refreshQuery.eq("user_id", userId);
      else refreshQuery = refreshQuery.eq("session_id", sessionId);

      const { data: refreshed } = await refreshQuery;
      const wishlistIds = (refreshed || []).map((r: any) => r.product_id);

      return NextResponse.json({ success: true, wishlistIds });
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Action 2: Add single product
    if (action === "add") {
      const { error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: userId || null,
          session_id: userId ? null : sessionId,
          product_id: productId,
        });

      if (error && !error.message.includes("duplicate")) {
        console.warn("Wishlist add error:", error.message);
      }

      return NextResponse.json({ success: true, isWishlisted: true });
    }

    // Action 3: Toggle product (add if not exists, remove if exists)
    let checkQuery = supabase
      .from("wishlist_items")
      .select("id")
      .eq("product_id", productId);

    if (userId) checkQuery = checkQuery.eq("user_id", userId);
    else checkQuery = checkQuery.eq("session_id", sessionId);

    const { data: existing } = await checkQuery;

    if (existing && existing.length > 0) {
      // Remove
      let deleteQuery = supabase
        .from("wishlist_items")
        .delete()
        .eq("product_id", productId);

      if (userId) deleteQuery = deleteQuery.eq("user_id", userId);
      else deleteQuery = deleteQuery.eq("session_id", sessionId);

      await deleteQuery;
      return NextResponse.json({ success: true, isWishlisted: false, action: "removed" });
    } else {
      // Add
      await supabase
        .from("wishlist_items")
        .insert({
          user_id: userId || null,
          session_id: userId ? null : sessionId,
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
