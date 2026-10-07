import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";

/**
 * "Resources" list of guide links for marketing/landing pages. Titles come from the
 * Guide table, in the order given, and unpublished or missing slugs are skipped — so a
 * deleted guide can never leave a dead link on a high-traffic page.
 */
export async function GuideResources({ slugs, className = "" }: { slugs: string[]; className?: string }) {
  const unique = Array.from(new Set(slugs));
  if (unique.length === 0) return null;

  const guides = await prisma.guide
    .findMany({
      where: { slug: { in: unique }, isPublished: true },
      select: { slug: true, title: true },
    })
    .catch(() => []);
  if (guides.length === 0) return null;

  const ordered = unique
    .map((s) => guides.find((g) => g.slug === s))
    .filter((g): g is { slug: string; title: string } => Boolean(g));

  return (
    <section className={`bg-vault-surf rounded-2xl border border-vault-ink/12 p-6 ${className}`}>
      <h2 className="font-vault-display italic text-2xl text-vault-ink mb-4">Resources</h2>
      <ul className="space-y-2.5">
        {ordered.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="group inline-flex items-start gap-2 text-vault-gold font-medium hover:underline"
            >
              <ArrowRight className="h-4 w-4 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
              <span>{g.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
