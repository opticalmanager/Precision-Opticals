import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/adminDb";

export async function GET() {
  try {
    const res = await query(
      `SELECT * FROM public.appointments ORDER BY appointment_date DESC, created_at DESC;`
    );

    return NextResponse.json({
      success: true,
      appointments: res.rows,
    });
  } catch (error: any) {
    console.error("Appointments GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load appointments" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Appointment ID required" }, { status: 400 });
    }

    const updates: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (status) {
      updates.push(`status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${pIdx}`);
      params.push(notes);
      pIdx++;
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    const res = await query(
      `UPDATE public.appointments
       SET ${updates.join(", ")}
       WHERE id::text = $${pIdx} OR booking_reference = $${pIdx}
       RETURNING *;`,
      params
    );

    return NextResponse.json({
      success: true,
      message: "Appointment updated",
      appointment: res.rows[0],
    });
  } catch (error: any) {
    console.error("Appointments PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}
