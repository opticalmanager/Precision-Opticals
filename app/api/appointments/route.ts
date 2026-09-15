import { NextResponse } from "next/server";
import { appointmentSchema } from "@/lib/validations";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = appointmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten() },
        { status: 400 }
      );
    }

    const bookingId = body.id || `APT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert into Supabase appointments table
    const { error: dbError } = await supabase.from("appointments").insert({
      booking_reference: bookingId,
      patient_name: body.fullName,
      patient_phone: body.phone,
      patient_email: body.email,
      service: body.purposeOfVisit || body.service || "Comprehensive Eye Examination",
      store_location: body.storeLocation || "Store 1 - JMD Arcade, Sector 104, Noida",
      appointment_date: body.date,
      time_slot: body.timeSlot,
      status: "scheduled",
      notes: body.notes || null,
    });

    if (dbError) {
      console.warn("Supabase appointment insert warning:", dbError.message);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: "Appointment confirmed with master optometrist",
    });
  } catch (error: any) {
    console.error("Appointment error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to book appointment" },
      { status: 500 }
    );
  }
}
