import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const accountId = process.env.R2_ACCOUNT_ID || "60b5b6284d20e2f6dbb15298f1778400";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "56598c1f1d0fe0331a433c7fc34da144";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "32dc102cee96309b1f6061c5afa377b4d60504e1702aaf43fe9bb67e19060061";
const bucketName = process.env.R2_BUCKET_NAME || "precision-optics-catalog";
const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

/**
 * Upload a file buffer directly to Cloudflare R2 (with local fallback if offline)
 * @param fileBuffer Buffer or Uint8Array of the file
 * @param fileName Target filename in bucket (e.g. 'products/cartier-ct001-angle1.webp')
 * @param contentType MIME type of the file (e.g. 'image/webp', 'video/mp4')
 * @returns Public CDN URL or local URL of the uploaded media
 */
export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return public CDN URL
    const cleanDomain = publicDomain.replace(/\/$/, "");
    const cleanKey = fileName.replace(/^\//, "");
    return `${cleanDomain}/${cleanKey}`;
  } catch (error) {
    console.warn("R2 upload error, falling back to local public directory:", error);

    // Local fallback for offline/development resilience
    const localDir = path.join(process.cwd(), "public", "uploads", path.dirname(fileName));
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localPath = path.join(process.cwd(), "public", "uploads", fileName);
    fs.writeFileSync(localPath, fileBuffer);

    return `/uploads/${fileName}`;
  }
}

/**
 * Extract R2 object key from a full URL or local path
 * e.g. "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/reels/123-video.mp4" -> "reels/123-video.mp4"
 * e.g. "/uploads/banners/123-hero.jpg" -> "banners/123-hero.jpg"
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    // If local /uploads/ URL
    if (url.startsWith("/uploads/")) {
      return url.replace(/^\/uploads\//, "");
    }
    // If full http(s) URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      const pathname = parsed.pathname.replace(/^\//, "");
      return pathname || null;
    }
    // If already a relative key
    return url.replace(/^\//, "");
  } catch {
    return null;
  }
}

/**
 * Delete a file from Cloudflare R2 (and local fallback directory if present)
 * @param fileName Key of the file in the bucket (e.g. "banners/123.jpg")
 */
export async function deleteFromR2(fileName: string): Promise<boolean> {
  const cleanKey = fileName.replace(/^\//, "");
  let deleted = false;

  // 1. Attempt R2 Bucket Deletion
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
    });
    await r2Client.send(command);
    deleted = true;
  } catch (err) {
    console.warn(`R2 delete warning for ${cleanKey}:`, err);
  }

  // 2. Also remove local fallback file if it exists
  try {
    const localPath = path.join(process.cwd(), "public", "uploads", cleanKey);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      deleted = true;
    }
  } catch (err) {
    console.warn(`Local file unlink warning for ${cleanKey}:`, err);
  }

  return deleted;
}
