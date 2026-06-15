import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { getOgImage } from "@/lib/seo-config";

export const revalidate = 3600;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("home");
  const title = "AuthorLoft vs BookFunnel: Features, Sales & Pricing Compared";
  const description =
    "How AuthorLoft compares to BookFunnel for independent authors — a full author website, direct ebook, audiobook and print sales, newsletters, and reader magnets, side by side.";
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/compare/bookfunnel` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE}/compare/bookfunnel`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft vs BookFunnel" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

// ── Feature comparison data ──────────────────────────────────────────────────
type Cell = "yes" | "no" | "limited";
const ROWS: { label: string; authorloft: Cell; bookfunnel: Cell; note?: string }[] = [
  { label: "Full author website builder",      authorloft: "yes", bookfunnel: "no",      note: "BookFunnel centres on delivery & reader magnets, not a website." },
  { label: "Custom domain",                    authorloft: "yes", bookfunnel: "no" },
  { label: "Unlimited books & series",         authorloft: "yes", bookfunnel: "limited" },
  { label: "Custom pages, events & news",      authorloft: "yes", bookfunnel: "no" },
  { label: "Reviews & ratings",                authorloft: "yes", bookfunnel: "no" },
  { label: "Direct eBook sales",               authorloft: "yes", bookfunnel: "yes" },
  { label: "Direct audiobook sales",           authorloft: "yes", bookfunnel: "limited" },
  { label: "Direct print book sales",          authorloft: "yes", bookfunnel: "limited" },
  { label: "Newsletter capture & campaigns",   authorloft: "yes", bookfunnel: "no",      note: "BookFunnel builds your list; campaigns are sent from your own ESP." },
  { label: "Reader magnets / free downloads",  authorloft: "yes", bookfunnel: "yes" },
  { label: "Mailing-list integrations",        authorloft: "yes", bookfunnel: "yes" },
  { label: "Analytics",                        authorloft: "yes", bookfunnel: "yes" },
];

function CellIcon({ v }: { v: Cell }) {
  if (v === "yes") return <Check className="h-5 w-5 text-emerald-600" aria-label="Yes" />;
  if (v === "limited") return <Minus className="h-5 w-5 text-amber-500" aria-label="Limited" />;
  return <X className="h-5 w-5 text-gray-300" aria-label="No" />;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is AuthorLoft a good BookFunnel alternative?",
    a: "Yes — if you want more than ebook delivery. BookFunnel excels at distributing files and reader magnets, but it isn't a website builder. AuthorLoft gives independent authors a full branded author website with a custom domain, plus direct sales of ebooks, audiobooks and print, newsletters, and a discovery bookstore — so readers can find you and buy from your own site.",
  },
  {
    q: "Can I sell ebooks, audiobooks and print books directly with AuthorLoft?",
    a: "Yes. AuthorLoft supports direct sales of all three formats — ebook, audiobook and print — from your own author site, with payouts via Stripe. BookFunnel focuses on ebook delivery, with more limited audiobook and print options.",
  },
  {
    q: "Does BookFunnel build an author website?",
    a: "No. BookFunnel is built around delivering ebooks and audiobooks to readers and running reader-magnet giveaways and newsletter swaps. It does not provide a full author website with custom pages, a custom domain, blog/news, or a storefront — which is the core of what AuthorLoft does.",
  },
  {
    q: "Can I use AuthorLoft alongside BookFunnel?",
    a: "Many authors do. You can keep using BookFunnel for advance reader copies and giveaways while using AuthorLoft as your home base — your website, newsletter, storefront, and bookstore listing. AuthorLoft also has its own ARC and reader-magnet tools if you'd rather consolidate.",
  },
  {
    q: "How much does AuthorLoft cost compared to BookFunnel?",
    a: "AuthorLoft has a free plan that includes a hosted author site and newsletter capture, with paid tiers that unlock a custom domain, direct sales, email campaigns and more. See the AuthorLoft pricing page for current plans; BookFunnel is sold as annual author plans priced by mailing-list size.",
  },
];

export default async function CompareBookFunnelPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Comparison"
        title={<>AuthorLoft vs <span className="italic text-[#D4AE6A]">BookFunnel</span></>}
        subtitle="Both help independent authors reach readers — but they solve different problems. Here's an honest, side-by-side look at where each one fits."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* TL;DR */}
        <section className="mb-12">
          <p className="text-lg text-[#3d3328] leading-relaxed">
            <strong>The short version:</strong> <strong>BookFunnel</strong> is the go-to for <em>delivering</em> ebooks
            and audiobooks to readers and running reader-magnet giveaways. <strong>AuthorLoft</strong> is a full{" "}
            <strong>author website platform</strong> — your own branded site and storefront where readers discover you
            and buy ebooks, audiobooks and print directly, with newsletters and a discovery bookstore built in.
          </p>
        </section>

        {/* Choose which */}
        <section className="grid sm:grid-cols-2 gap-4 mb-14">
          <div className="bg-white rounded-2xl border border-[#DCDBD3] p-6">
            <h2 className="font-serif text-xl text-[#1B2B47] mb-3">Choose AuthorLoft if…</h2>
            <ul className="space-y-2 text-sm text-[#4d4337]">
              <li>You want a real author website on your own domain</li>
              <li>You want to sell ebooks, audiobooks <em>and</em> print direct</li>
              <li>You want newsletters, a blog/news, and a discovery bookstore</li>
              <li>You want one branded home base instead of scattered tools</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-[#DCDBD3] p-6">
            <h2 className="font-serif text-xl text-[#1B2B47] mb-3">Choose BookFunnel if…</h2>
            <ul className="space-y-2 text-sm text-[#4d4337]">
              <li>Your main need is delivering ebooks/audiobooks to readers</li>
              <li>You run lots of reader-magnet giveaways and newsletter swaps</li>
              <li>You already have a website and just need fulfilment</li>
              <li>You distribute ARCs to reviewers at scale</li>
            </ul>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl text-[#1B2B47] mb-5">Feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-[#DCDBD3] bg-white">
            <table className="w-full text-sm min-w-[460px]">
              <thead>
                <tr className="border-b border-[#ECEAE2] bg-[#F7F5EF]">
                  <th className="text-left font-semibold text-[#1B2B47] px-4 py-3">Feature</th>
                  <th className="font-semibold text-[#1B2B47] px-4 py-3 text-center">AuthorLoft</th>
                  <th className="font-semibold text-[#1B2B47] px-4 py-3 text-center">BookFunnel</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label} className="border-b border-[#F0EEE7] last:border-0 align-top">
                    <td className="px-4 py-3 text-[#3d3328]">
                      {r.label}
                      {r.note && <span className="block text-xs text-[#9b8e7e] mt-0.5">{r.note}</span>}
                    </td>
                    <td className="px-4 py-3"><span className="flex justify-center"><CellIcon v={r.authorloft} /></span></td>
                    <td className="px-4 py-3"><span className="flex justify-center"><CellIcon v={r.bookfunnel} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#9b8e7e] mt-3">
            <Check className="inline h-3.5 w-3.5 text-emerald-600" /> Included ·{" "}
            <Minus className="inline h-3.5 w-3.5 text-amber-500" /> Limited ·{" "}
            <X className="inline h-3.5 w-3.5 text-gray-300" /> Not offered. Based on publicly described features; check each
            provider for the latest.
          </p>
        </section>

        {/* The core difference */}
        <section className="mb-14 prose prose-stone max-w-none">
          <h2 className="font-serif text-2xl text-[#1B2B47]">The core difference</h2>
          <p className="text-[#4d4337]">
            BookFunnel answers the question <em>"how do I get my book file to a reader?"</em> — reliably, across every
            device and e-reader. AuthorLoft answers a bigger one: <em>"where do readers find me, follow me, and buy from
            me?"</em> That means a branded website on your own domain, a storefront that sells ebooks, audiobooks and
            print directly, newsletter capture and campaigns, reviews, and a listing in the AuthorLoft discovery
            bookstore. The two aren't mutually exclusive — but if you only run one, AuthorLoft is the one that becomes
            your author home base.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl text-[#1B2B47] mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl border border-[#DCDBD3] p-6">
                <h3 className="font-semibold text-[#1B2B47] mb-2">{f.q}</h3>
                <p className="text-sm text-[#4d4337] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1B2B47] rounded-2xl px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AE6A] mb-3">· Start free ·</p>
          <h2 className="font-serif text-2xl text-[#E8E5DD] font-normal mb-4">
            Build your author home base on AuthorLoft
          </h2>
          <p className="text-sm text-[#D4DDEB] max-w-md mx-auto mb-6">
            A free hosted author site and newsletter capture to start — upgrade for a custom domain and direct sales when
            you're ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-[#D4AE6A] font-medium px-6 py-3 rounded-full border border-[#3a4a66] hover:border-[#D4AE6A] transition-colors"
            >
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
