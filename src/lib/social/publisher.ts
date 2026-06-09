import { prisma }           from "@/lib/db";
import { decryptToken }     from "@/lib/social/encrypt";
import { postToLinkedIn }   from "@/lib/social/linkedin";
import { postToFacebook }   from "@/lib/social/facebook";
import { postToInstagram }  from "@/lib/social/instagram";
import { postToTwitter, TwitterCredentials } from "@/lib/social/twitter";

export type Platform = "LINKEDIN" | "FACEBOOK" | "INSTAGRAM" | "TWITTER";

interface PublishTarget {
  platform:    Platform;
  accessToken: string;   // decrypted
  accountId:   string;
}

/**
 * Publishes a SocialPost to all its target platforms.
 * Creates SocialPostResult rows for each platform.
 * Updates post status when done.
 */
export async function publishSocialPost(postId: string): Promise<void> {
  const post = await prisma.socialPost.findUnique({
    where:   { id: postId },
    include: { results: true },
  });
  if (!post) throw new Error(`SocialPost ${postId} not found`);

  // Mark as PUBLISHING
  await prisma.socialPost.update({
    where: { id: postId },
    data:  { status: "PUBLISHING" },
  });

  // Load tokens for the requested platforms
  const tokens = await prisma.socialPlatformToken.findMany({
    where: { platform: { in: post.platforms }, isActive: true },
  });

  const targets: PublishTarget[] = tokens.map((t) => ({
    platform:    t.platform as Platform,
    accessToken: decryptToken(t.accessToken),
    accountId:   t.accountId,
  }));

  // Publish to each platform in parallel
  const settled = await Promise.allSettled(
    targets.map((target) => publishToOne(post, target))
  );

  // Upsert SocialPostResult for each platform
  const now = new Date();
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const result = settled[i];

    if (result.status === "fulfilled") {
      await prisma.socialPostResult.upsert({
        where:  { id: `${postId}_${target.platform}` },
        update: {
          status:         "PUBLISHED",
          platformPostId: result.value.platformPostId,
          error:          null,
          publishedAt:    now,
        },
        create: {
          id:             `${postId}_${target.platform}`,
          postId,
          platform:       target.platform,
          status:         "PUBLISHED",
          platformPostId: result.value.platformPostId,
          publishedAt:    now,
        },
      });
    } else {
      const errMsg = result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);

      await prisma.socialPostResult.upsert({
        where:  { id: `${postId}_${target.platform}` },
        update: { status: "FAILED", error: errMsg },
        create: {
          id:       `${postId}_${target.platform}`,
          postId,
          platform: target.platform,
          status:   "FAILED",
          error:    errMsg,
        },
      });
    }
  }

  // Determine overall post status
  const publishedCount = settled.filter((s) => s.status === "fulfilled").length;
  const failedCount    = settled.filter((s) => s.status === "rejected").length;

  let finalStatus: string;
  if (publishedCount === 0)                         finalStatus = "FAILED";
  else if (failedCount === 0)                       finalStatus = "PUBLISHED";
  else                                              finalStatus = "PARTIAL";

  await prisma.socialPost.update({
    where: { id: postId },
    data:  { status: finalStatus, publishedAt: publishedCount > 0 ? now : null },
  });
}

async function publishToOne(
  post:   { caption: string; mediaUrl: string | null; mediaType: string | null },
  target: PublishTarget,
): Promise<{ platformPostId: string }> {
  switch (target.platform) {
    case "LINKEDIN":
      return postToLinkedIn(target.accessToken, target.accountId, post.caption, post.mediaUrl);

    case "FACEBOOK":
      return postToFacebook(target.accessToken, target.accountId, post.caption, post.mediaUrl);

    case "INSTAGRAM":
      if (!post.mediaUrl) throw new Error("Instagram requires an image — no media URL set on this post");
      return postToInstagram(target.accessToken, target.accountId, post.caption, post.mediaUrl);

    case "TWITTER": {
      // For Twitter the decrypted token is a JSON blob of the 4 OAuth 1.0a credentials.
      const creds = JSON.parse(target.accessToken) as TwitterCredentials;
      return postToTwitter(creds, post.caption, post.mediaUrl);
    }

    default:
      throw new Error(`Unknown platform: ${target.platform}`);
  }
}
