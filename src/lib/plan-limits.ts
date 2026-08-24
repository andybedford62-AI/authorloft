import { prisma } from "@/lib/db";

// Fallback limits used when an author has no plan assigned and no default plan exists.
// Everything is open so new sign-ups are never accidentally locked out.
const OPEN_LIMITS = {
  maxBooks:        null as number | null,
  maxPosts:        null as number | null,
  maxStorageMb:    null as number | null,
  customDomain:    false,
  salesEnabled:    true,
  newsletter:      true,
  analyticsEnabled:false,
  flipBooksLimit:  -1,  // unlimited when no plan assigned
  audioEnabled:    false,
  mediaKitEnabled: false,
  preOrdersEnabled: true,
  coursesEnabled:  true,
  maxCourses:      null as number | null,
};

// ─── Core lookup ─────────────────────────────────────────────────────────────

export async function getAuthorPlanLimits(authorId: string) {
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    include: { plan: true },
  });
  if (author?.plan) return author.plan;

  // Fall back to the platform default plan
  const defaultPlan = await prisma.plan.findFirst({
    where: { isDefault: true, isActive: true },
  });
  if (defaultPlan) return defaultPlan;

  return OPEN_LIMITS;
}

// ─── Quantity limits ──────────────────────────────────────────────────────────

export async function canAddBook(
  authorId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getAuthorPlanLimits(authorId);
  if (limits.maxBooks === null) return { allowed: true };

  const current = await prisma.book.count({ where: { authorId } });
  if (current >= limits.maxBooks) {
    return {
      allowed: false,
      reason: `Your plan allows up to ${limits.maxBooks} book${limits.maxBooks === 1 ? "" : "s"}. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}

export async function canAddCourse(
  authorId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getAuthorPlanLimits(authorId);
  if (!(limits as any).coursesEnabled) {
    return {
      allowed: false,
      reason: "Your current plan does not include courses. Upgrade your plan to create one.",
    };
  }

  const maxCourses = (limits as any).maxCourses as number | null;
  if (maxCourses === null || maxCourses === undefined) return { allowed: true };

  const current = await prisma.course.count({ where: { authorId, kind: "COURSE" } });
  if (current >= maxCourses) {
    return {
      allowed: false,
      reason: `Your plan allows up to ${maxCourses} course${maxCourses === 1 ? "" : "s"}. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}

export async function canAddMusicList(
  authorId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getAuthorPlanLimits(authorId);
  if (!(limits as any).musicEnabled) {
    return {
      allowed: false,
      reason: "Your current plan does not include music lists. Upgrade your plan to create one.",
    };
  }

  const max = (limits as any).maxMusicLists as number | null;
  if (max === null || max === undefined) return { allowed: true };

  const current = await prisma.course.count({ where: { authorId, kind: "MUSIC" } });
  if (current >= max) {
    return {
      allowed: false,
      reason: `Your plan allows up to ${max} music list${max === 1 ? "" : "s"}. Upgrade your plan to add more.`,
    };
  }
  return { allowed: true };
}

/** Tracks-per-list cap. Null on the plan means unlimited. */
export async function maxTracksPerList(authorId: string): Promise<number | null> {
  const limits = await getAuthorPlanLimits(authorId);
  const max = (limits as any).maxTracksPerList as number | null | undefined;
  return max ?? null;
}

export async function canPublishPost(
  authorId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getAuthorPlanLimits(authorId);
  if (limits.maxPosts === null) return { allowed: true };

  const current = await prisma.post.count({ where: { authorId, isPublished: true } });
  if (current >= limits.maxPosts) {
    return {
      allowed: false,
      reason: `Your plan allows up to ${limits.maxPosts} published post${limits.maxPosts === 1 ? "" : "s"}. Upgrade your plan to publish more.`,
    };
  }
  return { allowed: true };
}

export async function canAddFlipBook(
  authorId: string
): Promise<{ allowed: boolean; reason?: string; limit: number; current: number }> {
  const limits = await getAuthorPlanLimits(authorId);
  const limit = (limits as any).flipBooksLimit ?? 0;

  if (limit === 0) {
    return {
      allowed: false,
      limit: 0,
      current: 0,
      reason: "Your current plan does not include flip books. Upgrade to Standard or Premium to add flip books.",
    };
  }

  const current = await prisma.flipBook.count({ where: { authorId } });

  if (limit !== -1 && current >= limit) {
    return {
      allowed: false,
      limit,
      current,
      reason: `Your plan allows up to ${limit} flip book${limit === 1 ? "" : "s"}. Upgrade to Premium for unlimited flip books.`,
    };
  }

  return { allowed: true, limit, current };
}

// ─── Feature flags ────────────────────────────────────────────────────────────

export async function canUseFeature(
  authorId: string,
  feature: "customDomain" | "salesEnabled" | "newsletter" | "analyticsEnabled" | "audioEnabled" | "mediaKitEnabled" | "preOrdersEnabled"
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getAuthorPlanLimits(authorId);

  const featureLabels: Record<string, string> = {
    customDomain:     "custom domain",
    salesEnabled:     "direct sales",
    newsletter:       "newsletter",
    analyticsEnabled: "analytics",
    audioEnabled:     "audio previews",
    mediaKitEnabled:  "media kit",
    preOrdersEnabled: "pre-orders / coming soon",
  };

  if (!(limits as any)[feature]) {
    return {
      allowed: false,
      reason: `Your current plan does not include ${featureLabels[feature] ?? feature}. Upgrade your plan to access this feature.`,
    };
  }
  return { allowed: true };
}

// ─── ARC management gate ─────────────────────────────────────────────────────

export async function canUseArc(
  authorId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { plan: { select: { tier: true } } },
  });
  const tier = author?.plan?.tier ?? "FREE";
  if (tier === "FREE") {
    return {
      allowed: false,
      reason: "ARC management requires a Standard or Premium plan. Upgrade to start sending advance reader copies.",
    };
  }
  return { allowed: true };
}

// ─── Convenience: check feature and return 403 response payload ───────────────

export async function assertFeature(
  authorId: string,
  feature: "customDomain" | "salesEnabled" | "newsletter" | "analyticsEnabled" | "audioEnabled" | "mediaKitEnabled" | "preOrdersEnabled"
) {
  const result = await canUseFeature(authorId, feature);
  return result; // Caller decides how to respond
}
