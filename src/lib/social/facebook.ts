/**
 * Facebook Page posting via Graph API.
 * Docs: https://developers.facebook.com/docs/pages-api/posts
 */

export interface FacebookPostResult {
  platformPostId: string;
}

const GRAPH = "https://graph.facebook.com/v19.0";

/**
 * Post text (+ optional image) to a Facebook Page.
 */
export async function postToFacebook(
  accessToken: string,
  pageId:      string,
  caption:     string,
  imageUrl?:   string | null,
): Promise<FacebookPostResult> {
  let endpoint: string;
  let body: Record<string, string>;

  if (imageUrl) {
    // Photo post — creates a photo post with caption
    endpoint = `${GRAPH}/${pageId}/photos`;
    body     = { url: imageUrl, caption, access_token: accessToken };
  } else {
    // Text-only post
    endpoint = `${GRAPH}/${pageId}/feed`;
    body     = { message: caption, access_token: accessToken };
  }

  const res = await fetch(endpoint, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Facebook API error ${res.status}: ${err.error?.message ?? JSON.stringify(err)}`);
  }

  const data = await res.json();
  return { platformPostId: data.id ?? data.post_id ?? "unknown" };
}

/**
 * Validates a Facebook token by fetching the page name.
 */
export async function testFacebookToken(
  accessToken: string,
  pageId:      string,
): Promise<string> {
  const res = await fetch(
    `${GRAPH}/${pageId}?fields=name&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error(`Facebook token test failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.name ?? `Page ${pageId}`;
}
