import { NextRequest, NextResponse } from "next/server";
import { uploadToR2, deleteFromR2, extractKeyFromUrl } from "@/lib/r2";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proxyUrl = searchParams.get("proxyUrl") || searchParams.get("url");

    if (!proxyUrl) {
      return NextResponse.json({ error: "No URL provided for proxy" }, { status: 400 });
    }

    // 1. Local path
    if (proxyUrl.startsWith("/")) {
      const sanitized = proxyUrl.replace(/^\/+/, "").replace(/\.\./g, "");
      const filePath = path.join(process.cwd(), "public", sanitized);
      if (fs.existsSync(filePath)) {
        const fileBuffer = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        let contentType = "video/mp4";
        if (ext === ".webm") contentType = "video/webm";
        else if (ext === ".mov") contentType = "video/quicktime";
        else if (ext === ".png") contentType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".glb") contentType = "model/gltf-binary";
        else if (ext === ".gltf") contentType = "model/gltf+json";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": fileBuffer.length.toString(),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }

    // 2. Remote URL (R2 or external)
    if (proxyUrl.startsWith("http://") || proxyUrl.startsWith("https://")) {
      const response = await fetch(proxyUrl, {
        headers: {
          "User-Agent": "Precision-Opticals/1.0",
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch remote asset: ${response.statusText}` },
          { status: response.status }
        );
      }

      const contentType = response.headers.get("content-type") || "video/mp4";
      const arrayBuffer = await response.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": arrayBuffer.byteLength.toString(),
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to proxy media" },
      { status: 500 }
    );
  }
}

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

    // Detect MIME type with fallback by extension
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "mp4") mimeType = "video/mp4";
      else if (ext === "webm") mimeType = "video/webm";
      else if (ext === "mov") mimeType = "video/quicktime";
      else if (ext === "png") mimeType = "image/png";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "svg") mimeType = "image/svg+xml";
      else if (ext === "glb") mimeType = "model/gltf-binary";
      else if (ext === "gltf") mimeType = "model/gltf+json";
      else mimeType = "image/jpeg";
    }

    const publicUrl = await uploadToR2(buffer, key, mimeType);

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

export async function DELETE(req: NextRequest) {
  try {
    let key: string | null = null;
    let url: string | null = null;

    // Check query params
    const { searchParams } = new URL(req.url);
    url = searchParams.get("url");
    key = searchParams.get("key");

    // Check body if not in query params
    if (!url && !key) {
      try {
        const body = await req.json();
        url = body.url || null;
        key = body.key || null;
      } catch {
        // body not present
      }
    }

    const targetKey = key || (url ? extractKeyFromUrl(url) : null);

    if (!targetKey) {
      return NextResponse.json(
        { error: "No valid file key or url provided" },
        { status: 400 }
      );
    }

    const deleted = await deleteFromR2(targetKey);

    return NextResponse.json({
      success: true,
      deletedKey: targetKey,
      wasFound: deleted,
    });
  } catch (error: any) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete file from storage" },
      { status: 500 }
    );
  }
}
