import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { prisma } from "@/lib/db";
import { MUSIC_GENRE_PALETTES } from "@/lib/themes";

/**
 * Music-only plan comparison for /for-musicians. Every number comes from the
 * live Plan rows (same source as /pricing), so a price or limit change in
 * Super Admin shows up here without a code edit. Theme and accent-colour
 * rows mirror isThemeAllowed() in src/lib/themes.ts: music genre palettes
 * are open to any plan once the author publishes music.
 */

type PlanRow = Awaited<ReturnType<typeof getPlans>>[number];

async function getPlans() {
  return prisma.plan.findMany({
    where: { isActive: true, tier: { in: ["FREE", "STANDARD", "PREMIUM"] } },
    select: {
      tier: true,
      name: true,
      monthlyPriceCents: true,
      annualPriceCents: true,
      featuredLabel: true,
      musicEnabled: true,
      maxMusicLists: true,
      maxTracksPerList: true,
      customDomain: true,
      newsletter: true,
      analyticsEnabled: true,
      socialMonthlyLimit: true,
      bookstoreListingEnabled: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

const dollars = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
const limit = (n: number | null) => (n === null ? "Unlimited" : String(n));

// A value of `true` renders a check, `false` a muted dash, a string as-is.
function rowsFor(p: PlanRow): { label: string; value: string | boolean }[] {
  return [
    { label: "Music Lists", value: p.musicEnabled ? limit(p.maxMusicLists) : false },
    { label: "Tracks per list", value: p.musicEnabled ? limit(p.maxTracksPerList) : false },
    { label: "Docked player + Play all", value: p.musicEnabled },
    { label: "Song share links, share kit & QR", value: p.musicEnabled },
    { label: "Fan newsletter & campaigns", value: p.newsletter },
    { label: "Bookstore catalog listing", value: p.bookstoreListingEnabled },
    { label: `${MUSIC_GENRE_PALETTES.length} music genre themes`, value: p.musicEnabled },
    { label: "AI Social Promote posts", value: p.socialMonthlyLimit > 0 ? `${p.socialMonthlyLimit}/mo` : false },
    { label: "Custom domain", value: p.customDomain },
    { label: "Analytics dashboard", value: p.analyticsEnabled },
    { label: "Custom accent colours", value: p.tier === "PREMIUM" },
  ];
}

export async function MusicPlansSection() {
  let plans: PlanRow[] = [];
  try {
    plans = await getPlans();
  } catch {
    // DB hiccup: skip the section rather than fail the whole landing page.
  }
  if (plans.length === 0) return null;

  return (
    <section className="mb-14" id="plans">
      <h2 className="font-vault-display italic text-2xl text-vault-ink mb-3">Plans for musicians</h2>
      <p className="text-[#c7cede] leading-relaxed mb-6">
        Every plan includes music, including Free. Upgrade for more releases, your own domain, and AI promotion.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => {
          const highlighted = p.tier === "STANDARD";
          return (
            <div
              key={p.tier}
              className={`rounded-2xl border p-5 flex flex-col ${highlighted ? "border-vault-gold bg-vault-surf-2" : "border-vault-ink/12 bg-vault-surf"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold text-vault-ink">{p.name}</h3>
                {p.featuredLabel && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-vault-gold">{p.featuredLabel}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-vault-ink">
                {p.monthlyPriceCents === 0 ? "Free" : dollars(p.monthlyPriceCents)}
                {p.monthlyPriceCents > 0 && <span className="text-sm font-normal text-vault-mute">/mo</span>}
              </p>
              <p className="text-xs text-vault-mute mb-4">
                {p.monthlyPriceCents === 0 ? "Forever, no card needed" : `or ${dollars(p.annualPriceCents)}/yr`}
              </p>

              <ul className="space-y-2 text-sm flex-1">
                {rowsFor(p).map(({ label, value }) => (
                  <li key={label} className="flex items-start gap-2">
                    {value === false ? (
                      <Minus className="h-4 w-4 text-vault-mute/60 flex-shrink-0 mt-0.5" aria-label="Not included" />
                    ) : (
                      <Check className="h-4 w-4 text-vault-gold flex-shrink-0 mt-0.5" aria-label="Included" />
                    )}
                    <span className={value === false ? "text-vault-mute/70" : "text-vault-ink"}>
                      {label}
                      {typeof value === "string" && <span className="text-vault-gold font-medium">: {value}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-vault-mute">
        Also writing books or teaching?{" "}
        <Link href="/pricing" className="text-vault-gold font-medium hover:underline">See full pricing →</Link>
      </p>
    </section>
  );
}
