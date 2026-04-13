/**
 * Supabase Storage helper — server-side only.
 * Uses the Supabase Storage REST API directly (no @supabase/supabase-js needed).
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL      e.g. https://abcxyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     your project's service-role (secret) key
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  // Warn loudly at boot time rather than silently failing at upload time.
  console.warn(
    "[supabase-storage] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. " +
    "File uploads will fail until these are configured."
  );
}

/**
 * Upload a Buffer to a Supabase Storage bucket.
 *
 * @param bucket      Bucket name, e.g. "book-covers"
 * @param path        Object path inside the bucket, e.g. "author-id/1234567890.jpg"
 * @param data        File contents as a Buffer
 * @param contentType MIME type, e.g. "image/jpeg"
 * @returns           Public URL of the uploaded object
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true", // overwrite if path already exists
    },
    body: data,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase Storage upload failed (${res.status}): ${body}`);
  }

  // Return the public URL (bucket must be set to Public in Supabase dashboard)
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Delete an object from a Supabase Storage bucket.
 *
 * @param bucket  Bucket name
 * @param path    Object path inside the bucket
 */
export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) return;

  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
}
