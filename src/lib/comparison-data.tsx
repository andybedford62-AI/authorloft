import type { ReactNode } from "react";

// Data for the /compare/[competitor] "vs" landing pages (SEO + GEO assets).
// Feature claims mirror the pricing-page matrix and each competitor's publicly
// described product. Keep comparisons fair and accurate.

export type Cell = "yes" | "no" | "limited";

export interface ComparisonRow {
  label: string;
  us:   Cell;   // AuthorLoft
  them: Cell;   // competitor
  note?: string;
}

export interface ComparisonFaq {
  q: string;
  a: string;
}

export interface ComparisonData {
  slug:           string;
  name:           string;          // competitor display name
  metaTitle:      string;          // root layout appends " | AuthorLoft"
  metaDescription: string;         // keep ≤ ~155 chars for Google
  subtitle:       string;          // brand-band subtitle
  tldr:           ReactNode;
  chooseUs:       string[];        // "Choose AuthorLoft if…"
  chooseThem:     string[];        // "Choose <competitor> if…"
  rows:           ComparisonRow[];
  coreDifference: ReactNode;
  faqs:           ComparisonFaq[];
}

export const COMPARISONS: Record<string, ComparisonData> = {
  // ── BookFunnel ─────────────────────────────────────────────────────────────
  bookfunnel: {
    slug: "bookfunnel",
    name: "BookFunnel",
    metaTitle: "AuthorLoft vs BookFunnel: Features, Sales & Pricing Compared",
    metaDescription:
      "AuthorLoft vs BookFunnel for indie authors: a full author website plus direct ebook, audiobook and print sales, newsletters and reader magnets — compared.",
    subtitle:
      "Both help independent authors reach readers — but they solve different problems. Here's an honest, side-by-side look at where each one fits.",
    tldr: (
      <>
        <strong>The short version:</strong> <strong>BookFunnel</strong> is the go-to for <em>delivering</em> ebooks and
        audiobooks to readers and running reader-magnet giveaways. <strong>AuthorLoft</strong> is a full{" "}
        <strong>author website platform</strong> — your own branded site and storefront where readers discover you and
        buy ebooks, audiobooks and print directly, with newsletters and a discovery bookstore built in.
      </>
    ),
    chooseUs: [
      "You want a real author website on your own domain",
      "You want to sell ebooks, audiobooks and print direct",
      "You want newsletters, a blog/news, and a discovery bookstore",
      "You want one branded home base instead of scattered tools",
    ],
    chooseThem: [
      "Your main need is delivering ebooks/audiobooks to readers",
      "You run lots of reader-magnet giveaways and newsletter swaps",
      "You already have a website and just need fulfilment",
      "You distribute ARCs to reviewers at scale",
    ],
    rows: [
      { label: "Full author website builder",     us: "yes", them: "no",      note: "BookFunnel centres on delivery & reader magnets, not a website." },
      { label: "Custom domain",                   us: "yes", them: "no" },
      { label: "Unlimited books & series",        us: "yes", them: "limited" },
      { label: "Custom pages, events & news",     us: "yes", them: "no" },
      { label: "Reviews & ratings",               us: "yes", them: "no" },
      { label: "Direct eBook sales",              us: "yes", them: "yes" },
      { label: "Direct audiobook sales",          us: "yes", them: "limited" },
      { label: "Direct print book sales",         us: "yes", them: "limited" },
      { label: "Newsletter capture & campaigns",  us: "yes", them: "no",      note: "BookFunnel builds your list; campaigns are sent from your own ESP." },
      { label: "Reader magnets / free downloads", us: "yes", them: "yes" },
      { label: "Mailing-list integrations",       us: "yes", them: "yes" },
      { label: "Analytics",                       us: "yes", them: "yes" },
    ],
    coreDifference: (
      <>
        BookFunnel answers the question <em>&ldquo;how do I get my book file to a reader?&rdquo;</em> — reliably, across
        every device and e-reader. AuthorLoft answers a bigger one: <em>&ldquo;where do readers find me, follow me, and
        buy from me?&rdquo;</em> That means a branded website on your own domain, a storefront that sells ebooks,
        audiobooks and print directly, newsletter capture and campaigns, reviews, and a listing in the AuthorLoft
        discovery bookstore. The two aren&apos;t mutually exclusive — but if you only run one, AuthorLoft is the one
        that becomes your author home base.
      </>
    ),
    faqs: [
      { q: "Is AuthorLoft a good BookFunnel alternative?", a: "Yes — if you want more than ebook delivery. BookFunnel excels at distributing files and reader magnets, but it isn't a website builder. AuthorLoft gives independent authors a full branded author website with a custom domain, plus direct sales of ebooks, audiobooks and print, newsletters, and a discovery bookstore — so readers can find you and buy from your own site." },
      { q: "Can I sell ebooks, audiobooks and print books directly with AuthorLoft?", a: "Yes. AuthorLoft supports direct sales of all three formats — ebook, audiobook and print — from your own author site, with payouts via Stripe. BookFunnel focuses on ebook delivery, with more limited audiobook and print options." },
      { q: "Does BookFunnel build an author website?", a: "No. BookFunnel is built around delivering ebooks and audiobooks to readers and running reader-magnet giveaways and newsletter swaps. It does not provide a full author website with custom pages, a custom domain, blog/news, or a storefront — which is the core of what AuthorLoft does." },
      { q: "Can I use AuthorLoft alongside BookFunnel?", a: "Many authors do. You can keep using BookFunnel for advance reader copies and giveaways while using AuthorLoft as your home base — your website, newsletter, storefront, and bookstore listing. AuthorLoft also has its own ARC and reader-magnet tools if you'd rather consolidate." },
      { q: "How much does AuthorLoft cost compared to BookFunnel?", a: "AuthorLoft has a free plan that includes a hosted author site and newsletter capture, with paid tiers that unlock a custom domain, direct sales, email campaigns and more. See the AuthorLoft pricing page for current plans; BookFunnel is sold as annual author plans priced by mailing-list size." },
    ],
  },

  // ── StoryOrigin ────────────────────────────────────────────────────────────
  storyorigin: {
    slug: "storyorigin",
    name: "StoryOrigin",
    metaTitle: "AuthorLoft vs StoryOrigin: Website, Direct Sales & Marketing",
    metaDescription:
      "AuthorLoft vs StoryOrigin for authors: a full website and storefront selling ebooks, audiobooks and print direct vs newsletter swaps and reader magnets.",
    subtitle:
      "StoryOrigin is an author-marketing powerhouse; AuthorLoft is your website and storefront. Here's where each one shines — and why many authors use both.",
    tldr: (
      <>
        <strong>The short version:</strong> <strong>StoryOrigin</strong> is a powerful author <em>marketing</em> toolkit
        — newsletter swaps, group promos, reader magnets and review management. <strong>AuthorLoft</strong> is your
        author <strong>website and storefront</strong>, where readers buy ebooks, audiobooks and print directly, with a
        discovery bookstore built in. Many authors grow their list with StoryOrigin and use AuthorLoft as their home
        base.
      </>
    ),
    chooseUs: [
      "You want a branded website and storefront on your own domain",
      "You want to sell ebooks, audiobooks and print direct",
      "You want a listing in a discovery bookstore",
      "You want one home base for your whole author presence",
    ],
    chooseThem: [
      "Newsletter swaps and group promos are central to your marketing",
      "You want to grow your mailing list through author cross-promotion",
      "You manage lots of ARC / review-copy distribution",
      "You mainly need reader magnets wired to your existing ESP",
    ],
    rows: [
      { label: "Full author website builder",         us: "yes", them: "yes" },
      { label: "Custom domain",                       us: "yes", them: "yes" },
      { label: "Direct eBook sales",                  us: "yes", them: "yes" },
      { label: "Direct audiobook sales",              us: "yes", them: "no",  note: "StoryOrigin distributes audiobook promo/review codes, not direct sales." },
      { label: "Direct print book sales",             us: "yes", them: "no" },
      { label: "Newsletter swaps & group promos",     us: "no",  them: "yes", note: "StoryOrigin's signature feature — AuthorLoft focuses on your own site & storefront." },
      { label: "Reader magnets / ARC distribution",   us: "yes", them: "yes" },
      { label: "Discovery bookstore listing",         us: "yes", them: "no" },
      { label: "Newsletter capture & campaigns",      us: "yes", them: "yes" },
      { label: "Analytics",                           us: "yes", them: "yes" },
    ],
    coreDifference: (
      <>
        StoryOrigin is about <em>growth through collaboration</em> — swapping newsletter features with other authors,
        running group giveaways, and distributing reader magnets and review copies to build your list. AuthorLoft is
        about <em>owning your home base</em> — a branded website and storefront where you sell ebooks, audiobooks and
        print directly and get discovered in the bookstore. They overlap on reader magnets and websites, but their
        centre of gravity is different: StoryOrigin grows the audience, AuthorLoft converts and sells to it. Plenty of
        authors run both.
      </>
    ),
    faqs: [
      { q: "Is AuthorLoft a good StoryOrigin alternative?", a: "It depends on your goal. If you want a branded website and storefront that sells ebooks, audiobooks and print directly, AuthorLoft is the stronger home base. If your priority is newsletter swaps and author group promotions to grow your mailing list, that's StoryOrigin's specialty — and many authors use both together." },
      { q: "Does AuthorLoft do newsletter swaps like StoryOrigin?", a: "No. Newsletter swaps and group promotions are StoryOrigin's signature feature and AuthorLoft doesn't replicate them. AuthorLoft focuses on your own website, newsletter capture and campaigns, direct sales, and discovery through the AuthorLoft bookstore." },
      { q: "Can I sell audiobooks and print books directly with AuthorLoft?", a: "Yes. AuthorLoft supports direct sales of ebooks, audiobooks and print from your own site with Stripe payouts. StoryOrigin handles direct ebook sales (via Lemon Squeezy) and distributes audiobook promo/review codes, but isn't built for direct audiobook or print sales." },
      { q: "Can I use AuthorLoft and StoryOrigin together?", a: "Yes, and many authors do. Use StoryOrigin for swaps, group promos and reader-magnet campaigns to grow your list, and use AuthorLoft as your website, storefront and bookstore presence. Both can capture subscribers and sync to your email provider." },
    ],
  },

  // ── Tertulia ───────────────────────────────────────────────────────────────
  tertulia: {
    slug: "tertulia",
    name: "Tertulia",
    metaTitle: "AuthorLoft vs Tertulia: Author Website & Direct Sales",
    metaDescription:
      "AuthorLoft vs Tertulia for authors: build a website that sells ebooks, audiobooks and print direct vs a reader discovery app with a basic author site.",
    subtitle:
      "Tertulia is a book-discovery app for readers that now offers a basic author site; AuthorLoft is built for authors to sell direct. Here's how they compare.",
    tldr: (
      <>
        <strong>The short version:</strong> <strong>Tertulia</strong> is a reader-facing <em>book discovery app</em>
        {" "}that recently added an author website builder which links out to retailers. <strong>AuthorLoft</strong> is
        built for authors to <strong>own their site and sell direct</strong> — ebooks, audiobooks and print on your own
        domain, with newsletters and a storefront, not just links to Amazon.
      </>
    ),
    chooseUs: [
      "You want to sell ebooks, audiobooks and print direct on your site",
      "You want newsletter capture and campaigns you control",
      "You want reader magnets and a storefront, not just retailer links",
      "You want a branded home base on your own domain",
    ],
    chooseThem: [
      "Your priority is being discovered in a reader-facing app",
      "You're happy sending readers to Amazon and other retailers",
      "You want a simple bio/links site tied to a discovery feed",
      "You don't need to sell or run a newsletter directly",
    ],
    rows: [
      { label: "Full author website builder",            us: "yes", them: "yes" },
      { label: "Custom domain",                          us: "yes", them: "yes" },
      { label: "Sell ebooks, audiobooks & print direct", us: "yes", them: "no",  note: "Tertulia links readers out to retailers; AuthorLoft sells direct on your site." },
      { label: "Newsletter capture",                     us: "yes", them: "yes" },
      { label: "Newsletter campaigns",                   us: "yes", them: "no" },
      { label: "Reader magnets / free downloads",        us: "yes", them: "no" },
      { label: "Reviews & ratings on your site",         us: "yes", them: "no" },
      { label: "Reader discovery app & feed",            us: "limited", them: "yes", note: "Tertulia's strength — a consumer app with daily recommendations." },
      { label: "Analytics",                              us: "yes", them: "yes" },
    ],
    coreDifference: (
      <>
        Tertulia started as a <em>discovery app for readers</em> — daily recommendations and trending lists pulled from
        conversations across the web — and added a lightweight author website that points readers to retailers.
        AuthorLoft comes at it from the author&apos;s side: a website and storefront you own, where readers buy ebooks,
        audiobooks and print <em>directly from you</em>, join your newsletter, and grab reader magnets. If your goal is
        reader-app discovery, Tertulia is interesting; if your goal is to own the sale and the reader relationship,
        that&apos;s AuthorLoft.
      </>
    ),
    faqs: [
      { q: "Is AuthorLoft a good Tertulia alternative?", a: "For authors who want to sell direct, yes. Tertulia is mainly a reader discovery app with a basic author website that links out to retailers. AuthorLoft is a full author website and storefront where you sell ebooks, audiobooks and print directly, run your newsletter, and get listed in the AuthorLoft bookstore." },
      { q: "Can I sell books directly with Tertulia?", a: "Tertulia's author tools point readers to external retailers rather than selling directly from your own site. AuthorLoft lets you sell ebooks, audiobooks and print directly with Stripe payouts, so you own the checkout and the customer relationship." },
      { q: "Does AuthorLoft help with reader discovery like Tertulia?", a: "AuthorLoft has a discovery bookstore where readers can browse books from independent authors by genre. It isn't a consumer recommendation app with a daily feed like Tertulia — its discovery is tied to your storefront and author site rather than a standalone reader app." },
      { q: "Can I use both Tertulia and AuthorLoft?", a: "Yes. You can list and get discovered on Tertulia while using AuthorLoft as your home base — your branded website, newsletter, and direct storefront for ebooks, audiobooks and print." },
    ],
  },
};

export const COMPARISON_SLUGS = Object.keys(COMPARISONS);
