import { NextResponse } from "next/server";
import { appointmentSchema } from "@/lib/validations";

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

    return NextResponse.json({
      success: true,
      bookingId,
      message: "Appointment confirmed with master optometrist",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}
