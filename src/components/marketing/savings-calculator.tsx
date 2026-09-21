"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import {
  AL_MONTHLY_HOURS,
  AL_SETUP_HOURS,
  DIY_ITEMS,
  FALLBACK_PLANS,
  GROUPS,
  PRICES_CHECKED,
  PRODUCT_LABEL,
  SOURCES,
  TIER_BY_RANK,
  TIER_RANK,
  type CalcPlan,
  type Product,
  type TierKey,
} from "@/lib/savings-calculator-data";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n: number) => usd.format(Math.round(n));
const perMonth = (n: number) => (n === 0 ? "$0" : n % 1 === 0 ? usd.format(n) : usd2.format(n));
const hrs = (n: number) => `${Math.round(n * 10) / 10}`;
const plural = (p: Product, n: number) => `${n} ${PRODUCT_LABEL[p][n === 1 ? 0 : 1]}`;

const TIER_BADGE: Record<TierKey, string> = {
  FREE: "bg-vault-good/15 text-vault-good",
  STANDARD: "bg-vault-gold/15 text-vault-gold",
  PREMIUM: "bg-vault-gold-light/15 text-vault-gold-light",
};
const TIER_TAG: Record<TierKey, string> = { FREE: "Free plan", STANDARD: "Standard plan", PREMIUM: "Premium plan" };

function countRank(plans: Record<TierKey, CalcPlan>, product: Product, n: number): number {
  const limit = (t: TierKey): number => {
    const p = plans[t];
    if (product === "books") return p.maxBooks ?? Infinity;
    if (product === "courses") return p.coursesEnabled ? (p.maxCourses ?? Infinity) : 0;
    return p.musicEnabled ? (p.maxMusicLists ?? Infinity) : 0;
  };
  if (n <= limit("FREE")) return 0;
  if (n <= limit("STANDARD")) return 1;
  return 2;
}

function Stepper({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-vault-ink mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`One fewer ${label.toLowerCase()}`}
          className="h-11 w-11 shrink-0 rounded-vault border border-vault-line bg-vault-bg text-vault-ink hover:border-vault-gold flex items-center justify-center"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={999}
          value={value}
          onChange={(e) => onChange(Math.min(999, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
          className="h-11 w-full min-w-0 rounded-vault border border-vault-line bg-vault-bg text-center text-lg font-semibold text-vault-ink focus:outline-none focus:border-vault-gold"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(999, value + 1))}
          aria-label={`One more ${label.toLowerCase()}`}
          className="h-11 w-11 shrink-0 rounded-vault border border-vault-line bg-vault-bg text-vault-ink hover:border-vault-gold flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SavingsCalculator({ plans: planList }: { plans: CalcPlan[] }) {
  const plans = useMemo(() => {
    const byTier = {} as Record<TierKey, CalcPlan>;
    for (const f of FALLBACK_PLANS) byTier[f.tier] = planList.find((p) => p.tier === f.tier) ?? f;
    return byTier;
  }, [planList]);

  const [counts, setCounts] = useState<Record<Product, number>>({ books: 3, courses: 0, music: 0 });
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DIY_ITEMS.map((i) => [i.id, !!i.defaultOn])),
  );
  const [rate, setRate] = useState(25);
  const [weeklyHours, setWeeklyHours] = useState(10);

  const r = useMemo(() => {
    const items = DIY_ITEMS.filter((i) => (!i.needs || counts[i.needs] > 0) && checked[i.id]);

    // The lowest AuthorLoft plan that covers everything picked.
    let need = 0;
    const why: string[] = [];
    const bump = (rank: number, name: string) => {
      if (rank > need) { need = rank; why.length = 0; why.push(name); }
      else if (rank === need && rank > 0) why.push(name);
    };
    for (const i of items) bump(TIER_RANK[i.tier], i.label);
    (["books", "courses", "music"] as Product[]).forEach((p) => bump(countRank(plans, p, counts[p]), plural(p, counts[p])));

    const tier = TIER_BY_RANK[need];
    const plan = plans[tier];
    const planMonthly = plan.monthlyPriceCents / 100;

    let diyMonthly = 0, diySetup = 0, diyHoursMonthly = 0, domain = 0;
    for (const i of items) {
      diyMonthly += i.cost; diySetup += i.setupHours; diyHoursMonthly += i.monthlyHours;
      if (i.paidEitherWay) domain += i.cost;
    }

    const diyTools = diyMonthly * 12;
    const diyHours = diySetup + diyHoursMonthly * 12;
    const diyTime = diyHours * rate;
    const alTools = (planMonthly + domain) * 12;
    const alHours = AL_SETUP_HOURS + AL_MONTHLY_HOURS * 12;
    const alTime = alHours * rate;

    const diyYear1 = diyTools + diyTime;
    const alYear1 = alTools + alTime;
    const diy3 = diyTools * 3 + (diySetup + diyHoursMonthly * 36) * rate;
    const al3 = alTools * 3 + (AL_SETUP_HOURS + AL_MONTHLY_HOURS * 36) * rate;

    return {
      items, need, why, tier, plan, planMonthly, domain,
      diyMonthly, diySetup, diyHoursMonthly, diyTools, diyHours, diyTime, diyYear1,
      alTools, alHours, alTime, alYear1,
      diy3, al3,
      weeks: diySetup / Math.max(1, weeklyHours),
    };
  }, [counts, checked, rate, weeklyHours, plans]);

  const saved = r.diyYear1 - r.alYear1;
  const toolsSaved = r.diyTools - r.alTools;
  const hoursBack = r.diyHours - r.alHours;
  const weeksText = r.weeks < 1 ? "under a week" : `about ${Math.ceil(r.weeks)} week${Math.ceil(r.weeks) === 1 ? "" : "s"}`;
  const planName = r.plan.name;
  const registerHref = r.tier === "FREE" ? "/register" : `/register?plan=${r.tier.toLowerCase()}`;

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const vendors = Array.from(new Set(r.items.map((i) => i.source)));

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
      {/* ── Questions ───────────────────────────────────────────── */}
      <div className="space-y-6">
        <a href="#results" className="lg:hidden inline-block text-sm font-semibold text-vault-gold underline underline-offset-4">
          Skip to my results ↓
        </a>

        {/* Step 1 */}
        <section className="rounded-2xl border border-vault-line bg-vault-surf p-6">
          <h2 className="text-xl font-bold text-vault-ink"><span className="text-vault-gold">1.</span> What do you create?</h2>
          <p className="mt-1 text-sm text-vault-mute">Enter how many of each you have or plan to have. Use 0 if you don&apos;t make that.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Stepper id="n-books" label="Books" value={counts.books} onChange={(n) => setCounts((c) => ({ ...c, books: n }))} />
            <Stepper id="n-courses" label="Courses" value={counts.courses} onChange={(n) => setCounts((c) => ({ ...c, courses: n }))} />
            <Stepper id="n-music" label="Music lists" value={counts.music} onChange={(n) => setCounts((c) => ({ ...c, music: n }))} />
          </div>
          <p className="mt-3 text-xs text-vault-mute">A &ldquo;music list&rdquo; is one playlist or album.</p>
        </section>

        {/* Step 2 */}
        <section className="rounded-2xl border border-vault-line bg-vault-surf p-6">
          <h2 className="text-xl font-bold text-vault-ink"><span className="text-vault-gold">2.</span> What do you want your website to do?</h2>
          <p className="mt-1 text-sm text-vault-mute">
            Tick everything you want. For each one, we show what it costs and how many hours it takes if you set it up yourself.
          </p>

          <div className="mt-5 space-y-4">
            {GROUPS.map((g) => {
              const rows = DIY_ITEMS.filter((i) => i.tier === g.tier && (!i.needs || counts[i.needs] > 0));
              const picked = rows.filter((i) => checked[i.id]).length;
              return (
                <details key={g.tier} open={g.tier === "FREE"} className="group rounded-xl border border-vault-line bg-vault-bg/40">
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-vault-ink">{g.title}</span>
                      <span className="block text-xs text-vault-mute">{g.blurb}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-vault-gold">
                      {picked} of {rows.length} chosen <span className="group-open:hidden">· tap to open</span>
                    </span>
                  </summary>
                  <ul className="divide-y divide-vault-line border-t border-vault-line">
                    {rows.map((i) => (
                      <li key={i.id}>
                        <label className="flex gap-3 px-4 py-3.5 cursor-pointer hover:bg-vault-surf-2/50">
                          <input
                            type="checkbox"
                            checked={!!checked[i.id]}
                            onChange={() => toggle(i.id)}
                            className="mt-1 h-5 w-5 shrink-0 accent-[#d6a94a]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-vault-ink">{i.label}</span>
                            <span className="block text-sm text-vault-mute leading-snug">{i.help}</span>
                            <span className="mt-1.5 block text-xs text-vault-mute">
                              Doing it yourself: <b className="text-vault-ink">{i.cost === 0 ? "no extra cost" : `about ${perMonth(i.cost)} a month`}</b>
                              {" · "}about <b className="text-vault-ink">{hrs(i.setupHours)} hours</b> to set up
                            </span>
                          </span>
                          <span className={`self-start shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${TIER_BADGE[i.tier]}`}>
                            {TIER_TAG[i.tier]}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </section>

        {/* Step 3 */}
        <section className="rounded-2xl border border-vault-line bg-vault-surf p-6">
          <h2 className="text-xl font-bold text-vault-ink"><span className="text-vault-gold">3.</span> What is an hour of your time worth?</h2>
          <p className="mt-1 text-sm text-vault-mute">
            Every hour spent building a website is an hour you are not writing, teaching or making music. Pick what an hour is worth to you — even what you would earn at another job.
          </p>
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="rate" className="font-medium text-vault-ink">Value of one hour</label>
              <span className="text-3xl font-bold text-vault-gold">{money(rate)}</span>
            </div>
            <input
              id="rate"
              type="range"
              min={10}
              max={150}
              step={5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-2 w-full accent-[#d6a94a] h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-vault-mute"><span>$10</span><span>$150</span></div>
          </div>
          <div className="mt-6">
            <label htmlFor="weekly" className="block font-medium text-vault-ink mb-2">How many hours a week could you spend building a site?</label>
            <select
              id="weekly"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="h-11 rounded-vault border border-vault-line bg-vault-bg px-3 text-vault-ink focus:outline-none focus:border-vault-gold"
            >
              {[3, 5, 10, 15, 20].map((h) => <option key={h} value={h}>{h} hours a week</option>)}
            </select>
            <p className="mt-2 text-xs text-vault-mute">We use this to estimate how many weeks it would take before your site is ready.</p>
          </div>
        </section>
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      <aside id="results" className="lg:sticky lg:top-6 space-y-5 scroll-mt-6">
        <div className="rounded-2xl border border-vault-gold/60 bg-vault-surf-2 p-6 shadow-xl shadow-vault-bg/30" aria-live="polite">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-vault-gold">Your results · first year</p>

          {r.items.length === 0 ? (
            <p className="mt-3 text-lg text-vault-ink">Tick at least one thing in step 2 to see the comparison.</p>
          ) : saved > 0 ? (
            <>
              <p className="mt-3 text-lg text-vault-ink leading-snug">With AuthorLoft {planName} you could save about</p>
              <p className="text-5xl font-bold text-vault-good leading-tight">{money(saved)}</p>
              <p className="text-vault-mute text-sm">in your first year, and get about <b className="text-vault-ink">{Math.round(hoursBack)} hours</b> back.</p>
            </>
          ) : (
            <p className="mt-3 text-lg text-vault-ink leading-snug">
              With these choices, doing it yourself would cost about the same or less. Try changing the hourly value or what you picked in step 2.
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-red-400/40 bg-vault-bg/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-vault-mute">Building it yourself</p>
              <p className="mt-1 text-2xl font-bold text-red-300">{money(r.diyYear1)}</p>
              <p className="text-xs text-vault-mute mt-1">{money(r.diyTools)} in tools + {money(r.diyTime)} for your time</p>
            </div>
            <div className="rounded-xl border border-vault-good/50 bg-vault-bg/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-vault-mute">AuthorLoft {planName}</p>
              <p className="mt-1 text-2xl font-bold text-vault-good">{money(r.alYear1)}</p>
              <p className="text-xs text-vault-mute mt-1">{money(r.alTools)} in fees + {money(r.alTime)} for your time</p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-vault-bg/50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-vault-mute">Saved on tools</dt>
              <dd className="mt-1 text-lg font-bold text-vault-ink">{money(toolsSaved)}</dd>
            </div>
            <div className="rounded-xl bg-vault-bg/50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-vault-mute">Hours back</dt>
              <dd className="mt-1 text-lg font-bold text-vault-ink">{Math.round(hoursBack)}</dd>
            </div>
            <div className="rounded-xl bg-vault-bg/50 p-3">
              <dt className="text-[11px] uppercase tracking-wide text-vault-mute">Live in</dt>
              <dd className="mt-1 text-lg font-bold text-vault-ink">Same day</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-vault-mute text-center">Building it yourself: {weeksText} before you&apos;re ready to launch.</p>

          <div className="mt-5 rounded-xl border border-vault-line bg-vault-bg/50 p-4 text-sm">
            <p className="font-semibold text-vault-ink">
              Your matching plan: {planName} · {r.planMonthly === 0 ? "$0" : `${perMonth(r.planMonthly)} a month`}
            </p>
            <p className="mt-1 text-vault-mute">
              {r.need === 0
                ? "Everything you picked is included on the Free plan."
                : `Needed for: ${r.why.slice(0, 3).join(", ")}${r.why.length > 3 ? ` and ${r.why.length - 3} more` : ""}.`}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link href={registerHref} className="text-center bg-vault-gold text-vault-bg font-semibold px-6 py-3 rounded-vault hover:bg-vault-gold-light transition-colors">
              {r.tier === "FREE" ? "Start free — no credit card" : `Start free, then choose ${planName}`}
            </Link>
            <Link href="/pricing" className="text-center text-vault-gold font-semibold px-6 py-3 rounded-vault border border-vault-gold/50 hover:bg-vault-gold/10 transition-colors">
              See all plans
            </Link>
          </div>
          <p className="mt-3 text-xs text-vault-mute text-center">
            AuthorLoft takes three steps: sign up (free), add a little about you, then add your first product. Your site appears instantly.
          </p>
        </div>

        <details className="rounded-2xl border border-vault-line bg-vault-surf p-5 text-sm">
          <summary className="cursor-pointer font-semibold text-vault-ink">How we worked this out</summary>
          <div className="mt-4 space-y-4 text-vault-mute leading-relaxed">
            <div>
              <p className="font-semibold text-vault-ink">Building it yourself</p>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Tools and subscriptions: {perMonth(r.diyMonthly)} a month × 12 = <b className="text-vault-ink">{money(r.diyTools)}</b></li>
                <li>Setting everything up: about {hrs(r.diySetup)} hours</li>
                <li>Keeping it running: about {hrs(r.diyHoursMonthly)} hours a month × 12 = {hrs(r.diyHoursMonthly * 12)} hours</li>
                <li>Your time: {hrs(r.diyHours)} hours × {money(rate)} = <b className="text-vault-ink">{money(r.diyTime)}</b></li>
                <li>First-year total: {money(r.diyTools)} + {money(r.diyTime)} = <b className="text-vault-ink">{money(r.diyYear1)}</b></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-vault-ink">With AuthorLoft {planName}</p>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>
                  Plan{r.domain > 0 ? " and your own web address" : ""}: {perMonth(r.planMonthly + r.domain)} a month × 12 = <b className="text-vault-ink">{money(r.alTools)}</b>
                </li>
                <li>Your time: about {AL_SETUP_HOURS} hours to set up, then about {AL_MONTHLY_HOURS} hour a month = {hrs(r.alHours)} hours × {money(rate)} = <b className="text-vault-ink">{money(r.alTime)}</b></li>
                <li>First-year total: {money(r.alTools)} + {money(r.alTime)} = <b className="text-vault-ink">{money(r.alYear1)}</b></li>
              </ul>
            </div>
            <p>
              <b className="text-vault-ink">Over three years:</b> {money(r.diy3)} building it yourself, compared with {money(r.al3)} on AuthorLoft.
            </p>
          </div>
        </details>

        <details className="rounded-2xl border border-vault-line bg-vault-surf p-5 text-sm">
          <summary className="cursor-pointer font-semibold text-vault-ink">Where do the prices come from?</summary>
          <div className="mt-4 space-y-3 text-vault-mute leading-relaxed">
            <p>
              The &ldquo;doing it yourself&rdquo; prices are what popular tools charge, checked on <b className="text-vault-ink">{PRICES_CHECKED}</b>. When a company offers a yearly discount we use it, so we don&apos;t overstate the cost. The hours are our own estimates.
            </p>
            <ul className="space-y-2">
              {vendors.map((v) => {
                const s = SOURCES[v];
                return (
                  <li key={v}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-vault-gold underline underline-offset-2">{s.vendor}</a>
                    {" — "}{s.detail}. <span className="text-xs">{s.official ? "Checked on the company’s own page." : "Reported by an independent price tracker."}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs">
              Prices change and your quote may differ. Card-payment fees are the same either way, so they aren&apos;t counted. Company names belong to their owners; AuthorLoft is not affiliated with them. All amounts are in US dollars.
            </p>
          </div>
        </details>
      </aside>
    </div>
  );
}
