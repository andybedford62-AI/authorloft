/**
 * LinkedIn Organization posting via UGC Posts API.
 * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api
 */

export interface LinkedInPostResult {
  platformPostId: string;
}

/**
 * Post text (+ optional image) to a LinkedIn Organization page.
 *
 * @param accessToken  Decrypted LinkedIn access token
 * @param organizationId  Numeric org ID (NOT the URN — we build the URN here)
 * @param caption  Post text
 * @param imageUrl  Optional public image URL (will be uploaded to LinkedIn first)
 */
export async function postToLinkedIn(
  accessToken:    string,
  organizationId: string,
  caption:        string,
  imageUrl?:      string | null,
): Promise<LinkedInPostResult> {
  const authorUrn = `urn:li:organization:${organizationId}`;

  let shareMediaCategory = "NONE";
  let media: object[] | undefined;

  if (imageUrl) {
    // Step 1: register the image with LinkedIn
    const asset = await uploadImageToLinkedIn(accessToken, authorUrn, imageUrl);
    shareMediaCategory = "IMAGE";
    media = [{ status: "READY", description: { text: "" }, media: asset, title: { text: "" } }];
  }

  const body: Record<string, unknown> = {
    author:           authorUrn,
    lifecycleState:   "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary:     { text: caption },
        shareMediaCategory,
        ...(media ? { media } : {}),
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method:  "POST",
    headers: {
      "Authorization":  `Bearer ${accessToken}`,
      "Content-Type":   "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`LinkedIn API error ${res.status}: ${err}`);
  }

  // LinkedIn returns the post URN in the X-RestLi-Id header
  const postId = res.headers.get("x-restli-id") ?? res.headers.get("X-RestLi-Id") ?? "unknown";
  return { platformPostId: postId };
}

/**
 * Registers an image URL with LinkedIn's media upload API and returns the asset URN.
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  authorUrn:   string,
  imageUrl:    string,
): Promise<string> {
  // Step 1: register upload
  const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type":  "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        owner:            authorUrn,
        recipes:          ["urn:li:digitalmediaRecipe:feedshare-image"],
        serviceRelationships: [{ identifier: "urn:li:userGeneratedContent", relationshipType: "OWNER" }],
      },
    }),
  });

  if (!registerRes.ok) {
    throw new Error(`LinkedIn register upload failed: ${registerRes.status}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl    = registerData.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl as string;
  const assetUrn     = registerData.value?.asset as string;

  if (!uploadUrl || !assetUrn) throw new Error("LinkedIn: missing uploadUrl or asset URN");

  // Step 2: fetch the image and upload it to LinkedIn
  const imgRes    = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Could not fetch image for LinkedIn upload: ${imageUrl}`);
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

  const uploadRes = await fetch(uploadUrl, {
    method:  "PUT",
    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/octet-stream" },
    body:    imgBuffer,
  });

  if (!uploadRes.ok) throw new Error(`LinkedIn image upload failed: ${uploadRes.status}`);

  return assetUrn;
}

/**
 * Validates a LinkedIn token by fetching the org profile.
 * Returns the org name on success, throws on failure.
 */
export async function testLinkedInToken(
  accessToken:    string,
  organizationId: string,
): Promise<string> {
  const res = await fetch(
    `https://api.linkedin.com/v2/organizations/${organizationId}?projection=(localizedName)`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    }
  );
  if (!res.ok) throw new Error(`LinkedIn token test failed: ${res.status}`);
  const data = await res.json();
  return data.localizedName ?? `Organization ${organizationId}`;
}
