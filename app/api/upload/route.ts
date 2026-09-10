import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${timestamp}-${cleanFileName}`;

    const publicUrl = await uploadToR2(buffer, key, file.type || "image/jpeg");

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image to Cloudflare R2" },
      { status: 500 }
    );
  }
}
