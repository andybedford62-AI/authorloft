import Link from "next/link";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getBookCompletionSummary } from "@/lib/book-completeness";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getAuthorBaseUrl } from "@/lib/site-url";

// ── Types ───────────────────────────────────────────────────────────────────

type ChecklistItem = {
  label: string;
  hint?:  string;
  done:   boolean;
  href?:  string | null;
};

type Section = {
  key:      string;
  title:    string;
  subtitle: string;
  items:    ChecklistItem[];
};

// ── Data ─────────────────────────────────────────────────────────────────────

async function getData(authorId: string) {
  const [author, books, courseCount] = await Promise.all([
    prisma.author.findUnique({
      where:  { id: authorId },
      select: {
        slug: true, customDomain: true, emailVerified: true, creatorType: true,
        bio: true, shortBio: true, profileImageUrl: true, logoUrl: true, tagline: true,
        customAccentColor: true,
        contactEmail: true, linkedinUrl: true, youtubeUrl: true, facebookUrl: true,
        twitterUrl: true, instagramUrl: true,
        stripeConnectOnboarded: true,
        pressTitle: true, pressBio: true,
        googleSiteVerification: true, bingSiteVerification: true,
        plan: { select: { customDomain: true, salesEnabled: true } },
      },
    }),
    prisma.book.findMany({
      where:  { authorId },
      select: {
        id: true, coverImageUrl: true, description: true, shortDescription: true, isPreOrder: true,
        _count: { select: { retailerLinks: true, directSaleItems: true } },
      },
    }),
    prisma.course.count({ where: { authorId, kind: "COURSE" } }),
  ]);

  return { author, books, courseCount };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function GettingStartedPage() {
  const authorId = await getAdminAuthorId();
  const { author, books, courseCount } = await getData(authorId);

  const wantsBook   = author?.creatorType !== "course";
  const wantsCourse = author?.creatorType === "course" || author?.creatorType === "both";

  const hasBook   = books.length > 0;
  const hasCourse = courseCount > 0;
  const incompleteBookCount = books.filter((b) => !getBookCompletionSummary({
    coverImageUrl:        b.coverImageUrl,
    description:          b.description,
    shortDescription:     b.shortDescription,
    retailerLinksCount:   b._count.retailerLinks,
    directSaleItemsCount: b._count.directSaleItems,
    isPreOrder:           b.isPreOrder,
  }).isComplete).length;

  const hasSocial = !!(author?.linkedinUrl || author?.youtubeUrl || author?.facebookUrl
    || author?.twitterUrl || author?.instagramUrl);

  const sections: Section[] = [
    {
      key: "account", title: "Account",
      subtitle: "Required before anything else works",
      items: [
        {
          label: "Verify your email address", done: !!author?.emailVerified,
          hint: "Check your inbox for the verification link", href: null,
        },
      ],
    },
    {
      key: "profile", title: "Profile & Branding",
      subtitle: "What readers see about you",
      items: [
        {
          label: "Add a profile photo or logo",
          done: !!(author?.profileImageUrl || author?.logoUrl),
          hint: "Shown on your homepage and About page", href: "/admin/branding",
        },
        {
          label: "Write your bio",
          done: !!(author?.bio?.trim() || author?.shortBio?.trim()),
          hint: "Tell readers who you are and what you write", href: "/admin/branding",
        },
        {
          label: "Add a tagline",
          done: !!author?.tagline?.trim(),
          hint: "A one-line hook shown near your name", href: "/admin/branding",
        },
        {
          label: "Personalize your accent colour",
          done: !!author?.customAccentColor,
          hint: "Optional — otherwise your theme's default colour is used (Premium)",
          href: "/admin/appearance",
        },
      ],
    },
    {
      key: "catalog", title: wantsCourse && !wantsBook ? "Your First Course" : "Your First Book",
      subtitle: "The thing readers actually came for",
      items: [
        ...(wantsBook ? [
          {
            label: "Add your first book", done: hasBook,
            hint: "Title and a cover are enough to start", href: "/admin/books/new",
          },
          ...(hasBook ? [{
            label: incompleteBookCount === 0
              ? "Book details complete"
              : `Finish book details (${incompleteBookCount} book${incompleteBookCount === 1 ? "" : "s"} need${incompleteBookCount === 1 ? "s" : ""} more)`,
            done: incompleteBookCount === 0,
            hint: "Every book needs a cover, a description, and a way to buy it (or a pre-order wishlist)",
            href: "/admin/books",
          }] : []),
        ] : []),
        ...(wantsCourse ? [{
          label: "Add your first course", done: hasCourse,
          hint: "A title and one module is enough to start", href: "/admin/courses/new",
        }] : []),
      ],
    },
    {
      key: "contact", title: "Contact & Social",
      subtitle: "How readers reach you and follow you elsewhere",
      items: [
        {
          label: "Add a contact email", done: !!author?.contactEmail?.trim(),
          hint: "Shown on your Contact page", href: "/admin/branding",
        },
        {
          label: "Link at least one social profile", done: hasSocial,
          hint: "LinkedIn, YouTube, Facebook, X/Twitter, or Instagram", href: "/admin/branding",
        },
      ],
    },
    {
      key: "sell", title: "Get Paid",
      subtitle: "Required before you can sell directly to readers",
      items: [
        {
          label: "Connect Stripe for payouts", done: !!author?.stripeConnectOnboarded,
          hint: "Settings → Billing → Stripe Payouts", href: "/admin/settings?tab=billing",
        },
      ],
    },
    {
      key: "domain", title: "Site Address",
      subtitle: "Optional — your free authorloft.com address always works",
      items: [
        {
          label: "Connect a custom domain", done: !!author?.customDomain,
          hint: author?.plan?.customDomain
            ? "Point your own domain at your site"
            : "Available on the Standard and Premium plans",
          href: "/admin/settings",
        },
      ],
    },
    {
      key: "media", title: "Press & Media Kit",
      subtitle: "Optional — for interviews, podcasts, and press enquiries",
      items: [
        {
          label: "Fill out your media kit", done: !!(author?.pressTitle?.trim() || author?.pressBio?.trim()),
          hint: "Press bio, contact, and outlets you've been featured in", href: "/admin/media-kit",
        },
      ],
    },
    {
      key: "seo", title: "Search Engines",
      subtitle: "Optional — helps readers find you on Google and Bing",
      items: [
        {
          label: "Verify your site with Google or Bing",
          done: !!(author?.googleSiteVerification?.trim() || author?.bingSiteVerification?.trim()),
          hint: "Search Console / Bing Webmaster Tools verification codes", href: "/admin/search-engines",
        },
      ],
    },
  ];

  const allItems     = sections.flatMap((s) => s.items);
  const doneCount    = allItems.filter((i) => i.done).length;
  const totalCount   = allItems.length;
  const percent      = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const siteUrl       = author ? getAuthorBaseUrl({ slug: author.slug, customDomain: author.customDomain }) : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Getting Started</h1>
          <p className="text-gray-500 text-sm mt-1">
            Everything you can set up on your author site — required steps first, the rest is optional and can be done any time.
          </p>
        </div>
        {siteUrl && (
          <a
            href={siteUrl} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View my site <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">{doneCount} of {totalCount} set up</p>
          <p className="text-sm text-gray-500">{percent}%</p>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{section.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{section.subtitle}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${item.done ? "bg-green-500 border-green-500" : "border-gray-200 bg-white"}`}
                >
                  {item.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.done ? "text-gray-400 line-through" : "text-gray-900"}`}>
                    {item.label}
                  </p>
                  {!item.done && item.hint && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>
                  )}
                </div>
                {!item.done && item.href && (
                  <Link
                    href={item.href}
                    className="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                  >
                    Go <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
