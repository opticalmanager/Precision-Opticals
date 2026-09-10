import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
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
 * Upload a file buffer directly to Cloudflare R2
 * @param fileBuffer Buffer or Uint8Array of the file
 * @param fileName Target filename in bucket (e.g. 'products/cartier-ct001-angle1.webp')
 * @param contentType MIME type of the file (e.g. 'image/webp')
 * @returns Public CDN URL of the uploaded image
 */
export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<string> {
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
}

/**
 * Delete a file from Cloudflare R2
 * @param fileName Key of the file in the bucket
 */
export async function deleteFromR2(fileName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  await r2Client.send(command);
}
