/**
 * Twitter / X posting via API v2 with OAuth 1.0a user-context.
 * Docs: https://developer.x.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 *
 * Why OAuth 1.0a (not 2.0):
 *  - Posting ("write") requires user-context auth — app-only bearer tokens cannot post.
 *  - OAuth 1.0a credentials are long-lived (no refresh flow), so they fit the same
 *    "paste the credentials and we test them" model the other platforms use.
 *
 * The 4 credentials come from the X Developer Portal → Keys and tokens tab,
 * with the app set to "Read and Write" permissions:
 *   apiKey            (Consumer Key)
 *   apiSecret         (Consumer Secret)
 *   accessToken       (Access Token)
 *   accessTokenSecret (Access Token Secret)
 */

import { createHmac, randomBytes } from "crypto";

export interface TwitterCredentials {
  apiKey:            string;
  apiSecret:         string;
  accessToken:       string;
  accessTokenSecret: string;
}

export interface TwitterPostResult {
  platformPostId: string;
}

const API    = "https://api.twitter.com/2";
const UPLOAD = "https://upload.twitter.com/1.1/media/upload.json";

/** RFC 3986 percent-encoding (stricter than encodeURIComponent). */
function pctEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!*'()]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}

/**
 * Builds an OAuth 1.0a "Authorization" header for a request.
 *
 * `extraParams` must contain any query-string params AND any
 * application/x-www-form-urlencoded body params — those are part of the
 * signature base string. For JSON bodies and multipart/form-data, pass {}.
 */
function buildAuthHeader(
  creds:       TwitterCredentials,
  method:      string,
  baseUrl:     string,
  extraParams: Record<string, string> = {},
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key:     creds.apiKey,
    oauth_nonce:            randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            creds.accessToken,
    oauth_version:          "1.0",
  };

  // Signature base string: all params (oauth + request) sorted & encoded.
  const allParams = { ...oauthParams, ...extraParams };
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${pctEncode(k)}=${pctEncode(allParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    pctEncode(baseUrl),
    pctEncode(paramString),
  ].join("&");

  const signingKey = `${pctEncode(creds.apiSecret)}&${pctEncode(creds.accessTokenSecret)}`;
  const signature  = createHmac("sha1", signingKey).update(baseString).digest("base64");

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${pctEncode(k)}="${pctEncode(headerParams[k])}"`)
      .join(", ")
  );
}

/**
 * Post a tweet (text, with optional single image).
 * X/Twitter supports text-only posts, so an image is optional.
 */
export async function postToTwitter(
  creds:    TwitterCredentials,
  caption:  string,
  imageUrl?: string | null,
): Promise<TwitterPostResult> {
  let mediaId: string | undefined;

  if (imageUrl) {
    mediaId = await uploadMedia(creds, imageUrl);
  }

  const body: Record<string, unknown> = { text: caption };
  if (mediaId) body.media = { media_ids: [mediaId] };

  // JSON body → body params are NOT part of the OAuth signature base string.
  const auth = buildAuthHeader(creds, "POST", `${API}/tweets`);

  const res = await fetch(`${API}/tweets`, {
    method:  "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Twitter API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { platformPostId: data.data?.id ?? "unknown" };
}

/**
 * Uploads an image to Twitter (v1.1 simple upload) and returns its media_id.
 * Uses multipart/form-data, so the form fields are excluded from the signature.
 */
async function uploadMedia(creds: TwitterCredentials, imageUrl: string): Promise<string> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Could not fetch image for Twitter upload: ${imageUrl}`);
  const buffer      = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";

  const form = new FormData();
  form.append("media", new Blob([buffer], { type: contentType }));

  // multipart/form-data → no body params in the signature base string.
  const auth = buildAuthHeader(creds, "POST", UPLOAD);

  const res = await fetch(UPLOAD, {
    method:  "POST",
    headers: { Authorization: auth }, // let fetch set the multipart boundary
    body:    form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Twitter media upload error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const id   = data.media_id_string ?? (data.media_id != null ? String(data.media_id) : undefined);
  if (!id) throw new Error("Twitter: no media_id returned from upload");
  return id;
}

/**
 * Validates the 4 credentials by fetching the authenticated user.
 * Returns { name, userId } on success, throws on failure.
 */
export async function testTwitterTokens(
  creds: TwitterCredentials,
): Promise<{ name: string; userId: string }> {
  const url  = `${API}/users/me`;
  const auth = buildAuthHeader(creds, "GET", url);

  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Twitter token test failed: ${res.status} ${err}`);
  }

  const data     = await res.json();
  const username = data.data?.username;
  const userId   = data.data?.id;
  if (!userId) throw new Error("Could not retrieve Twitter user ID from credentials.");

  return { name: username ? `@${username}` : `User ${userId}`, userId };
}
