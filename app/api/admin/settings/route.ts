import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

function parseSettingValue(rawVal: any) {
  if (rawVal === null || rawVal === undefined) return null;
  if (typeof rawVal === "string") {
    try {
      const parsed = JSON.parse(rawVal);
      // In case of double stringification
      if (typeof parsed === "string") {
        try {
          return JSON.parse(parsed);
        } catch {
          return parsed;
        }
      }
      return parsed;
    } catch {
      return rawVal;
    }
  }
  return rawVal;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const res = await query(`SELECT value FROM public.admin_settings WHERE key = $1;`, [key]);
      const parsed = parseSettingValue(res.rows[0]?.value);

      return NextResponse.json(
        {
          success: true,
          key,
          value: parsed,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
          },
        }
      );
    }

    const allRes = await query(`SELECT key, value, updated_at FROM public.admin_settings;`);
    const settingsMap: Record<string, any> = {};
    for (const r of allRes.rows) {
      settingsMap[r.key] = parseSettingValue(r.value);
    }

    return NextResponse.json(
      {
        success: true,
        settings: settingsMap,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "key and value are required" }, { status: 400 });
    }

    const valParam = typeof value === "object" ? JSON.stringify(value) : String(value);
    const res = await query(
      `INSERT INTO public.admin_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING *;`,
      [key, valParam]
    );

    const parsed = parseSettingValue(res.rows[0]?.value);

    return NextResponse.json({
      success: true,
      message: `Settings for '${key}' updated successfully`,
      setting: res.rows[0],
      value: parsed,
    });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
