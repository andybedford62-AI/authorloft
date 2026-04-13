import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

// ── Upload a file to S3 ────────────────────────────────────────────────────
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

// ── Generate a pre-signed upload URL (for direct browser → S3 uploads) ────
export async function getUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// ── Generate a pre-signed download URL (for secure book delivery) ─────────
export async function getDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
  filename?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: filename
      ? `attachment; filename="${filename}"`
      : undefined,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

// ── Delete a file from S3 ─────────────────────────────────────────────────
export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
}

// ── Build S3 key paths by type ────────────────────────────────────────────
export const s3Keys = {
  coverImage: (authorId: string, bookId: string, ext: string) =>
    `authors/${authorId}/books/${bookId}/cover.${ext}`,
  bookFile: (authorId: string, bookId: string, ext: string) =>
    `authors/${authorId}/books/${bookId}/file.${ext}`,
  flipBook: (authorId: string, bookId: string) =>
    `authors/${authorId}/books/${bookId}/flipbook.pdf`,
  profileImage: (authorId: string, ext: string) =>
    `authors/${authorId}/profile.${ext}`,
  heroImage: (authorId: string, ext: string) =>
    `authors/${authorId}/hero.${ext}`,
};
