import { prisma } from "@/lib/db";
import { validateSlug, type SlugProblem } from "@/lib/reserved-slugs";

export type SlugUnavailableReason = SlugProblem | "taken" | "retired";

/**
 * Full availability check for an author site slug: format and reserved-word
 * validation, plus uniqueness against both live slugs and retired ones.
 *
 * Retired slugs (see AuthorSlugHistory) stay claimed forever so their 301
 * redirects keep working — letting someone else take one would break the
 * redirect and hand them the original author's accumulated search traffic.
 *
 * Pass `forAuthorId` so an author isn't blocked by their own current slug or by
 * one of their own retired slugs (i.e. changing back to a previous address).
 */
export async function checkSlugAvailability(
  slug: string,
  opts: { forAuthorId?: string } = {}
): Promise<SlugUnavailableReason | null> {
  const problem = validateSlug(slug);
  if (problem) return problem;

  const [live, retired] = await Promise.all([
    prisma.author.findUnique({ where: { slug }, select: { id: true } }),
    prisma.authorSlugHistory.findUnique({ where: { slug }, select: { authorId: true } }),
  ]);

  if (live && live.id !== opts.forAuthorId) return "taken";
  if (retired && retired.authorId !== opts.forAuthorId) return "retired";

  return null;
}

export function slugUnavailableMessage(reason: SlugUnavailableReason): string {
  switch (reason) {
    case "too_short": return "Site URL must be at least 3 characters.";
    case "too_long":  return "Site URL must be 40 characters or fewer.";
    case "reserved":  return "That site URL is reserved. Please choose another.";
    case "invalid":   return "Site URL may only contain lowercase letters, numbers, and hyphens.";
    case "taken":     return "That site URL is already taken. Please choose another.";
    case "retired":   return "That site URL was previously used by another author and can't be reused.";
  }
}
