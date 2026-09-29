import { prisma } from "@/lib/db";
import { sendPlanGraceEmail } from "@/lib/mailer";

/**
 * Plan-downgrade grace period.
 *
 * When an author's plan no longer covers what they have published (cancellation,
 * downgrade, or an expired trial), we give them GRACE_DAYS to upgrade or tidy up,
 * then automatically UNPUBLISH the excess — never delete it. Items hidden this way
 * carry `hiddenByPlanAt` so they can be restored on upgrade without touching
 * anything the author unpublished themselves. A custom domain that the plan no
 * longer includes stops serving after the same grace period (see
 * isCustomDomainSuspended) and redirects to the free subdomain.
 *
 * Everything here is driven by `reconcileAuthor`, which is idempotent: the daily
 * cron runs it for every author and the Stripe webhook runs it for one author so
 * cancellations and upgrades take effect immediately instead of overnight.
 */

export const GRACE_DAYS = 30;
const MID_REMINDER_DAY = 14;
const FINAL_REMINDER_DAY = 27;
const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Pure helpers (unit-tested) ──────────────────────────────────────────────

export type ContentKind = "books" | "courses" | "music" | "posts" | "flipBooks";

export const KIND_LABELS: Record<ContentKind, { singular: string; plural: string }> = {
  books:     { singular: "book",       plural: "books" },
  courses:   { singular: "course",     plural: "courses" },
  music:     { singular: "music list", plural: "music lists" },
  posts:     { singular: "blog post",  plural: "blog posts" },
  flipBooks: { singular: "flip book",  plural: "flip books" },
};

/** null = unlimited. */
export type KindLimits = Record<ContentKind, number | null>;

export type PlanLike = {
  maxBooks: number | null;
  maxPosts: number | null;
  maxCourses: number | null;
  maxMusicLists: number | null;
  coursesEnabled: boolean;
  musicEnabled: boolean;
  flipBooksLimit: number; // 0 = none, -1 = unlimited, n = max
  customDomain: boolean;
};

export function limitsFromPlan(plan: PlanLike): KindLimits {
  return {
    books:     plan.maxBooks ?? null,
    courses:   plan.coursesEnabled ? plan.maxCourses ?? null : 0,
    music:     plan.musicEnabled ? plan.maxMusicLists ?? null : 0,
    posts:     plan.maxPosts ?? null,
    flipBooks: plan.flipBooksLimit === -1 ? null : plan.flipBooksLimit,
  };
}

/** Items beyond the plan limit. `keepFirst` is ordered most-worth-keeping first. */
export function selectExcess<T>(keepFirst: T[], limit: number | null): T[] {
  if (limit === null || limit < 0) return [];
  return keepFirst.slice(limit);
}

/** Hidden items that fit back under the limit after an upgrade, in keep order. */
export function selectRestorable<T>(hiddenKeepFirst: T[], limit: number | null, publishedCount: number): T[] {
  if (limit === null || limit < 0) return hiddenKeepFirst;
  return hiddenKeepFirst.slice(0, Math.max(0, limit - publishedCount));
}

export type GraceAction = "none" | "clear" | "start" | "remind-mid" | "remind-final" | "apply";

export function decideGraceAction(input: {
  hasViolation: boolean;
  startedAt: Date | null;
  endsAt: Date | null;
  stage: number;
  now: Date;
}): GraceAction {
  const { hasViolation, startedAt, endsAt, stage, now } = input;

  if (!hasViolation) return endsAt || stage > 0 ? "clear" : "none";
  if (!endsAt) return "start";

  // Runs every time after the deadline (not just once) so re-publishing a hidden
  // item can't be used to sidestep the limit; emails are guarded by `stage`.
  if (now.getTime() >= endsAt.getTime()) return "apply";

  const began   = startedAt ?? new Date(endsAt.getTime() - GRACE_DAYS * DAY_MS);
  const elapsed = (now.getTime() - began.getTime()) / DAY_MS;
  if (stage < 3 && elapsed >= FINAL_REMINDER_DAY) return "remind-final";
  if (stage < 2 && elapsed >= MID_REMINDER_DAY)   return "remind-mid";
  return "none";
}

/** True once the grace period is over for an author whose plan excludes custom domains. */
export function isCustomDomainSuspendedFor(input: {
  customDomain: string | null;
  planAllowsCustomDomain: boolean;
  graceEndsAt: Date | null;
  now?: Date;
}): boolean {
  if (!input.customDomain || input.planAllowsCustomDomain || !input.graceEndsAt) return false;
  return input.graceEndsAt.getTime() <= (input.now ?? new Date()).getTime();
}

// ─── Data access ─────────────────────────────────────────────────────────────

const PLAN_SELECT = {
  name: true,
  maxBooks: true,
  maxPosts: true,
  maxCourses: true,
  maxMusicLists: true,
  coursesEnabled: true,
  musicEnabled: true,
  flipBooksLimit: true,
  customDomain: true,
} as const;

async function getDefaultPlan() {
  return prisma.plan.findFirst({ where: { isDefault: true, isActive: true }, select: PLAN_SELECT });
}

/** Author's effective plan (own plan, else the platform default). Null = no limits configured. */
async function resolvePlan(authorPlan: (PlanLike & { name: string }) | null) {
  return authorPlan ?? (await getDefaultPlan());
}

async function fetchPublished(authorId: string) {
  const [books, courses, music, posts, flipBooks] = await Promise.all([
    prisma.book.findMany({
      where: { authorId, isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
    prisma.course.findMany({
      where: { authorId, kind: "COURSE", isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
    prisma.course.findMany({
      where: { authorId, kind: "MUSIC", isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
    // Posts are time-based, so the newest ones are the ones worth keeping live.
    prisma.post.findMany({
      where: { authorId, isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    }),
    prisma.flipBook.findMany({
      where: { authorId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
  ]);
  const ids = (rows: { id: string }[]) => rows.map((r) => r.id);
  return { books: ids(books), courses: ids(courses), music: ids(music), posts: ids(posts), flipBooks: ids(flipBooks) } as Record<ContentKind, string[]>;
}

async function fetchHidden(authorId: string) {
  const [books, courses, music, posts, flipBooks] = await Promise.all([
    prisma.book.findMany({
      where: { authorId, isPublished: false, hiddenByPlanAt: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
    prisma.course.findMany({
      where: { authorId, kind: "COURSE", isPublished: false, hiddenByPlanAt: { not: null } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
    prisma.course.findMany({
      where: { authorId, kind: "MUSIC", isPublished: false, hiddenByPlanAt: { not: null } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
    prisma.post.findMany({
      where: { authorId, isPublished: false, hiddenByPlanAt: { not: null } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    }),
    prisma.flipBook.findMany({
      where: { authorId, isActive: false, hiddenByPlanAt: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    }),
  ]);
  const ids = (rows: { id: string }[]) => rows.map((r) => r.id);
  return { books: ids(books), courses: ids(courses), music: ids(music), posts: ids(posts), flipBooks: ids(flipBooks) } as Record<ContentKind, string[]>;
}

/** Drops a stale hidden marker from anything the author has since re-published themselves. */
async function clearStaleMarkers(authorId: string) {
  const clear = { hiddenByPlanAt: null };
  await Promise.all([
    prisma.book.updateMany({ where: { authorId, isPublished: true, hiddenByPlanAt: { not: null } }, data: clear }),
    prisma.course.updateMany({ where: { authorId, isPublished: true, hiddenByPlanAt: { not: null } }, data: clear }),
    prisma.post.updateMany({ where: { authorId, isPublished: true, hiddenByPlanAt: { not: null } }, data: clear }),
    prisma.flipBook.updateMany({ where: { authorId, isActive: true, hiddenByPlanAt: { not: null } }, data: clear }),
  ]);
}

async function setVisibility(kind: ContentKind, ids: string[], visible: boolean, now: Date) {
  if (ids.length === 0) return;
  const marker = visible ? null : now;
  const where = { id: { in: ids } };
  switch (kind) {
    case "books":     await prisma.book.updateMany({ where, data: { isPublished: visible, hiddenByPlanAt: marker } }); break;
    case "courses":
    case "music":     await prisma.course.updateMany({ where, data: { isPublished: visible, hiddenByPlanAt: marker } }); break;
    case "posts":     await prisma.post.updateMany({ where, data: { isPublished: visible, hiddenByPlanAt: marker } }); break;
    case "flipBooks": await prisma.flipBook.updateMany({ where, data: { isActive: visible, hiddenByPlanAt: marker } }); break;
  }
}

const KINDS: ContentKind[] = ["books", "courses", "music", "posts", "flipBooks"];

// ─── Analysis (read-only) ────────────────────────────────────────────────────

export type OverLimit = { kind: ContentKind; count: number; limit: number };

export type PlanAnalysis = {
  planName: string;
  limits: KindLimits | null;
  publishedCounts: Record<ContentKind, number>;
  excessIds: Record<ContentKind, string[]>;
  over: OverLimit[];
  domainViolation: boolean;
};

const emptyIds = (): Record<ContentKind, string[]> => ({ books: [], courses: [], music: [], posts: [], flipBooks: [] });

export async function analyzeAuthor(authorId: string): Promise<PlanAnalysis | null> {
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { customDomain: true, plan: { select: PLAN_SELECT } },
  });
  if (!author) return null;

  const plan = await resolvePlan(author.plan);
  // No plan configured anywhere: nothing to enforce.
  if (!plan) {
    return { planName: "Free", limits: null, publishedCounts: { books: 0, courses: 0, music: 0, posts: 0, flipBooks: 0 }, excessIds: emptyIds(), over: [], domainViolation: false };
  }

  const limits = limitsFromPlan(plan);
  const published = await fetchPublished(authorId);

  const excessIds = emptyIds();
  const over: OverLimit[] = [];
  const publishedCounts = {} as Record<ContentKind, number>;
  for (const kind of KINDS) {
    publishedCounts[kind] = published[kind].length;
    excessIds[kind] = selectExcess(published[kind], limits[kind]);
    if (excessIds[kind].length > 0) over.push({ kind, count: published[kind].length, limit: limits[kind] as number });
  }

  return {
    planName: plan.name,
    limits,
    publishedCounts,
    excessIds,
    over,
    domainViolation: !!author.customDomain && !plan.customDomain,
  };
}

/** For the admin dashboard notice. Null when there's nothing to warn about. */
export async function getPlanGraceNotice(authorId: string) {
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { planGraceEndsAt: true, customDomain: true },
  });
  if (!author?.planGraceEndsAt) return null;
  const analysis = await analyzeAuthor(authorId);
  if (!analysis || (analysis.over.length === 0 && !analysis.domainViolation)) return null;
  return {
    endsAt: author.planGraceEndsAt,
    ended: author.planGraceEndsAt.getTime() <= Date.now(),
    planName: analysis.planName,
    over: analysis.over,
    customDomain: analysis.domainViolation ? author.customDomain : null,
  };
}

/** Used by the author-site layout to decide whether a custom domain should redirect. */
export async function isCustomDomainSuspended(authorId: string): Promise<boolean> {
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { customDomain: true, planGraceEndsAt: true, plan: { select: PLAN_SELECT } },
  });
  if (!author?.customDomain || !author.planGraceEndsAt) return false;
  const plan = await resolvePlan(author.plan);
  return isCustomDomainSuspendedFor({
    customDomain: author.customDomain,
    planAllowsCustomDomain: plan?.customDomain ?? true,
    graceEndsAt: author.planGraceEndsAt,
  });
}

// ─── Reconcile (writes) ──────────────────────────────────────────────────────

export type ReconcileResult = {
  authorId: string;
  action: GraceAction;
  hidden: number;
  restored: number;
  emailed: string | null;
};

export async function reconcileAuthor(
  authorId: string,
  opts: { now?: Date; dryRun?: boolean } = {},
): Promise<ReconcileResult> {
  const now = opts.now ?? new Date();
  const dryRun = !!opts.dryRun;
  const result: ReconcileResult = { authorId, action: "none", hidden: 0, restored: 0, emailed: null };

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      id: true, email: true, name: true, displayName: true, customDomain: true, isActive: true,
      planGraceStartedAt: true, planGraceEndsAt: true, planGraceStage: true,
    },
  });
  if (!author || !author.isActive) return result;

  if (!dryRun) await clearStaleMarkers(authorId);

  const analysis = await analyzeAuthor(authorId);
  if (!analysis || !analysis.limits) return result;

  const hasViolation = analysis.over.length > 0 || analysis.domainViolation;
  const action = decideGraceAction({
    hasViolation,
    startedAt: author.planGraceStartedAt,
    endsAt: author.planGraceEndsAt,
    stage: author.planGraceStage,
    now,
  });
  result.action = action;

  const authorName = author.displayName || author.name;
  const sendEmail = async (stage: "started" | "reminder" | "final" | "applied", endsAt: Date) => {
    result.emailed = stage;
    if (dryRun) return;
    try {
      await sendPlanGraceEmail({
        to: author.email,
        authorName,
        stage,
        planName: analysis.planName,
        graceEndsAt: endsAt,
        over: analysis.over.map((o) => ({ ...KIND_LABELS[o.kind], count: o.count, limit: o.limit })),
        customDomain: analysis.domainViolation ? author.customDomain : null,
      });
    } catch (e) {
      console.error(`[plan-downgrade] ${stage} email failed for ${authorId}:`, e);
    }
  };

  switch (action) {
    case "start": {
      const endsAt = new Date(now.getTime() + GRACE_DAYS * DAY_MS);
      if (!dryRun) {
        await prisma.author.update({
          where: { id: authorId },
          data: { planGraceStartedAt: now, planGraceEndsAt: endsAt, planGraceStage: 1 },
        });
      }
      await sendEmail("started", endsAt);
      break;
    }
    case "remind-mid":
    case "remind-final": {
      const endsAt = author.planGraceEndsAt!;
      const stage = action === "remind-mid" ? 2 : 3;
      if (!dryRun) await prisma.author.update({ where: { id: authorId }, data: { planGraceStage: stage } });
      await sendEmail(action === "remind-mid" ? "reminder" : "final", endsAt);
      break;
    }
    case "apply": {
      for (const kind of KINDS) {
        const ids = analysis.excessIds[kind];
        if (ids.length === 0) continue;
        result.hidden += ids.length;
        if (!dryRun) await setVisibility(kind, ids, false, now);
      }
      if (author.planGraceStage < 4) {
        if (!dryRun) await prisma.author.update({ where: { id: authorId }, data: { planGraceStage: 4 } });
        await sendEmail("applied", author.planGraceEndsAt!);
      }
      break;
    }
    case "clear": {
      if (!dryRun) {
        await prisma.author.update({
          where: { id: authorId },
          data: { planGraceStartedAt: null, planGraceEndsAt: null, planGraceStage: 0 },
        });
      }
      break;
    }
    case "none":
      break;
  }

  // Upgrade / back within limits: bring back what the plan hid, up to the new limits.
  if (!hasViolation || action === "clear") {
    const hidden = await fetchHidden(authorId);
    if (KINDS.some((k) => hidden[k].length > 0)) {
      for (const kind of KINDS) {
        const restorable = selectRestorable(hidden[kind], analysis.limits[kind], analysis.publishedCounts[kind]);
        if (restorable.length === 0) continue;
        result.restored += restorable.length;
        if (!dryRun) await setVisibility(kind, restorable, true, now);
      }
    }
  }

  return result;
}

/** Runs reconcile for every active author. Errors are isolated per author. */
export async function reconcileAllAuthors(opts: { now?: Date; dryRun?: boolean } = {}) {
  const authors = await prisma.author.findMany({ where: { isActive: true }, select: { id: true } });
  const results: ReconcileResult[] = [];
  const failures: { authorId: string; error: string }[] = [];
  for (const { id } of authors) {
    try {
      results.push(await reconcileAuthor(id, opts));
    } catch (e) {
      failures.push({ authorId: id, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return { results, failures, total: authors.length };
}
