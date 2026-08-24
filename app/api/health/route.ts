import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Precision Optics Next.js 16 E-Commerce",
    timestamp: new Date().toISOString(),
  });
}
