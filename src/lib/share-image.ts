/** The image used when an author-site page is shared (Open Graph / Twitter card).
 *  The author's dedicated social share image wins; the profile photo is the
 *  fallback, so a site that never sets one behaves exactly as before. */
export function authorShareImage(author: {
  socialShareImageUrl?: string | null;
  profileImageUrl?: string | null;
}): string | null {
  return author.socialShareImageUrl || author.profileImageUrl || null;
}
