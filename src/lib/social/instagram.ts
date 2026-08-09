/**
 * Instagram Business Account posting via Graph API (two-step: container → publish).
 * Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 *
 * Requirements:
 *  - Instagram Business or Creator account
 *  - Account linked to a Facebook Page
 *  - image_url must be publicly accessible (Supabase public bucket ✅)
 */

export interface InstagramPostResult {
  platformPostId: string;
}

const GRAPH = "https://graph.facebook.com/v19.0";

/**
 * Post an image (required) with caption to Instagram Business Account.
 * Instagram does not support text-only posts via the API.
 */
export async function postToInstagram(
  accessToken:  string,
  igUserId:     string,
  caption:      string,
  imageUrl:     string,
): Promise<InstagramPostResult> {
  // Step 1: Create media container
  const containerRes = await fetch(`${GRAPH}/${igUserId}/media`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      image_url:    imageUrl,
      caption,
      access_token: accessToken,
    }),
  });

  if (!containerRes.ok) {
    const err = await containerRes.json().catch(() => ({ message: containerRes.statusText }));
    throw new Error(`Instagram container error ${containerRes.status}: ${err.error?.message ?? JSON.stringify(err)}`);
  }

  const { id: creationId } = await containerRes.json();
  if (!creationId) throw new Error("Instagram: no creation_id returned from container step");

  // Brief pause — Instagram recommends waiting before publishing
  await new Promise((r) => setTimeout(r, 2000));

  // Step 2: Publish the container
  const publishRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      creation_id:  creationId,
      access_token: accessToken,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({ message: publishRes.statusText }));
    throw new Error(`Instagram publish error ${publishRes.status}: ${err.error?.message ?? JSON.stringify(err)}`);
  }

  const data = await publishRes.json();
  return { platformPostId: data.id ?? "unknown" };
}

/**
 * Validates an Instagram token by fetching the account username.
 */
export async function testInstagramToken(
  accessToken: string,
  igUserId:    string,
): Promise<string> {
  const res = await fetch(
    `${GRAPH}/${igUserId}?fields=username&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error(`Instagram token test failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.username ? `@${data.username}` : `Account ${igUserId}`;
}
