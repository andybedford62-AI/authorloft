import Link from "next/link";
import { EyeOff, Lock, Info } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAuthorContentPresence } from "@/lib/author-queries";
import { getNavPageVisibility, type NavPageKey, type AuthorNavFlags } from "@/lib/site-pages";

// Shown at the top of a catalog screen when the matching public page is hidden
// from the author's site menu. Without it, an author can spend an afternoon
// building courses that nobody can reach and get no hint why — the toggle lives
// on a different screen entirely (/admin/pages).
//
// Renders nothing when the page is visible, so it can be dropped in
// unconditionally.

export async function NavVisibilityBanner({
  authorId,
  navKey,
}: {
  authorId: string;
  navKey: NavPageKey;
}) {
  const [author, presence] = await Promise.all([prisma.author.findUnique({
    where: { id: authorId },
    select: {
      navShowAbout: true, navShowBooks: true, navShowSpecials: true,
      navShowFlipBooks: true, navShowBlog: true, navShowContact: true,
      navShowMediaKit: true, navShowCourses: true, navShowBundles: true,
      navShowMusic: true,
      plan: {
        select: {
          flipBooksLimit: true, mediaKitEnabled: true,
          coursesEnabled: true, bundlesEnabled: true, musicEnabled: true,
        },
      },
    },
  }).catch(() => null), getAuthorContentPresence(authorId)]);

  if (!author) return null;

  const { visible, planBlocked, emptyBlocked, label, path } = getNavPageVisibility(
    author as unknown as AuthorNavFlags,
    presence,
    navKey
  );
  if (visible) return null;

  // Two different problems, two different fixes — telling an author to flip a
  // switch that their plan doesn't offer would just send them in a circle.
  if (planBlocked) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
        <Lock className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
        <span>
          <strong>{label}</strong> isn&apos;t included in your current plan, so the page
          won&apos;t appear on your site.{" "}
          <Link href="/admin/settings" className="underline font-medium">Upgrade your plan</Link>{" "}
          to publish it.
        </span>
      </div>
    );
  }

  // Toggle is on and the plan allows it, there's just nothing published yet —
  // the site holds the link back so visitors never land on an empty page.
  // Informational, not a warning: publishing the first item fixes it.
  if (emptyBlocked) {
    const noun = navKey === "books" ? "a book" : navKey === "courses" ? "a course" : "a music list";
    return (
      <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>
          Your <strong>{label}</strong> menu link is switched on, but it won&apos;t appear on
          your site until you publish {noun} — so visitors never land on an empty page.
          It shows up automatically once you do.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
      <EyeOff className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>
        Your <strong>{label}</strong> page is hidden from your site menu, so visitors
        can&apos;t find it — anything you add here stays invisible until you switch it on.{" "}
        <Link href="/admin/pages" className="underline font-medium">
          Show it in the menu
        </Link>
        <span className="text-amber-700"> (Pages &rarr; Navigation Menu)</span>. The page
        still works if you link to <code className="text-xs">{path}</code> directly.
      </span>
    </div>
  );
}
