import { revalidatePath } from "next/cache";
import { PLATFORM_AUTHOR } from "@/lib/platform-author";

/**
 * On-demand revalidation for the ISR content pages (blog, news, guides, founder
 * profile). Those pages cache for an hour, so every Super Admin write must call
 * one of these or edits will not show until the cache expires.
 *
 * The `[slug]` page patterns invalidate EVERY detail page, which also refreshes
 * the "related posts" lists on sibling posts and covers slug renames.
 */

export function revalidatePosts() {
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/news/[slug]", "page");
  revalidatePath("/blog");
  revalidatePath("/news");
  revalidatePath("/blog/rss.xml");
  revalidatePath("/news/rss.xml");
  revalidatePath(`/author/${PLATFORM_AUTHOR.slug}`);
  revalidatePath("/");
}

export function revalidateGuides() {
  revalidatePath("/guides/[slug]", "page");
  revalidatePath("/guides");
  revalidatePath("/guides/rss.xml");
  revalidatePath(`/author/${PLATFORM_AUTHOR.slug}`);
  revalidatePath("/");
}
