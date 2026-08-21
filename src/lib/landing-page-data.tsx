import type { ReactNode } from "react";

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingSection {
  title: string;
  description: string;
  bullets: string[];
}

export interface LandingPageData {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroTitle: ReactNode;
  heroSubtitle: string;
  intro: string;
  sections: LandingSection[];
  faqs: LandingFaq[];
  relatedGuideSlug?: string;
}

export const LANDING_PAGES: Record<string, LandingPageData> = {
  "author-website-builder": {
    slug: "author-website-builder",
    metaTitle: "Author Website Builder — Create Your Author Site in Minutes",
    metaDescription: "Build a professional author website with book pages, blog, custom domain, and direct sales — no coding required. Free to start.",
    eyebrow: "Author Website Builder",
    heroTitle: <>Build a professional author website <span className="italic text-[#D4AE6A]">without code</span></>,
    heroSubtitle: "A complete author site with book pages, blog, about page, and contact form — live in minutes, not months.",
    intro: "Your author website is the hub of your career. Unlike renting space on Amazon or social media, your website is yours — you control the design, the content, and every reader relationship. AuthorLoft gives you everything you need to build a beautiful, professional author site without touching a line of code.",
    sections: [
      {
        title: "Everything an author site needs, built in",
        description: "No plugins to install, no themes to debug. Every feature an author needs comes standard.",
        bullets: [
          "Book catalog with cover images, descriptions, excerpts, and buy links",
          "Blog and news section to connect with readers and boost SEO",
          "About page with bio, headshot, social links, and credentials",
          "Contact form so readers, media, and event organizers can reach you",
          "Custom pages for anything else — events, speaking, awards, bonus content",
          "Series pages that group books in reading order",
        ],
      },
      {
        title: "Your brand, your domain, your identity",
        description: "Look like a professional from day one with custom branding and your own domain.",
        bullets: [
          "Connect your own domain (yourname.com) on Standard and Premium plans",
          "Choose from multiple professionally designed themes",
          "Custom accent colors to match your brand (Premium)",
          "Your logo in the header — not AuthorLoft's",
          "Mobile-responsive design that looks great on every device",
        ],
      },
      {
        title: "Built for discoverability",
        description: "Your site is optimized for search engines and AI discovery from the start.",
        bullets: [
          "SEO-optimized page structure with proper meta tags and structured data",
          "Built-in blog with RSS feed for content marketing",
          "Canonical URLs and Open Graph tags on every page",
          "Listed in the AuthorLoft Bookstore for cross-promotion",
          "AI search engine optimized (GEO-ready) with Schema.org markup",
        ],
      },
    ],
    faqs: [
      { q: "Do I need to know how to code?", a: "No. AuthorLoft is a no-code platform. You manage everything through a visual admin dashboard — add books, write blog posts, update your bio, and customize your site without touching any code." },
      { q: "Can I use my own domain name?", a: "Yes. On Standard and Premium plans, you can connect your own custom domain (like yourname.com). Free plan sites are hosted on an authorloft.com subdomain." },
      { q: "How fast can I get my site live?", a: "Most authors have their site live within 15 minutes. Add your books, write a short bio, choose a theme, and you're ready to share your link with readers." },
      { q: "What if I already have an author website?", a: "You can migrate at your own pace. Many authors run AuthorLoft alongside their existing site initially, then switch their domain once they're ready." },
      { q: "Is there a free plan?", a: "Yes. The Free plan includes your author website with book catalog, blog, about page, and contact form — free forever with no credit card required." },
    ],
    relatedGuideSlug: "what-is-an-author-website",
  },

  "sell-books-directly": {
    slug: "sell-books-directly",
    metaTitle: "Sell Books Directly to Readers — Keep 100% of Revenue",
    metaDescription: "Sell ebooks, print books, and audiobooks directly to readers. Keep 100% of your revenue with AuthorLoft's built-in direct sales platform.",
    eyebrow: "Direct Book Sales",
    heroTitle: <>Sell books directly and <span className="italic text-[#D4AE6A]">keep every dollar</span></>,
    heroSubtitle: "No marketplace fees, no middleman. Sell ebooks, print books, and audiobooks straight to your readers.",
    intro: "Every sale through Amazon, Kobo, or another retailer costs you 30–65% in fees. With AuthorLoft, you sell directly to your readers and keep 100% of the revenue (minus standard payment processing). Your books, your prices, your customers — no middleman.",
    sections: [
      {
        title: "Multiple formats, one storefront",
        description: "Sell every format your readers want, all from your own author website.",
        bullets: [
          "Ebooks — instant digital delivery after purchase",
          "Print books — link to your print-on-demand fulfillment",
          "Audiobooks — sell audio directly with built-in preview player",
          "Flip Books — interactive page-turn previews that convert browsers to buyers",
          "Bundle multiple formats per book with individual pricing",
        ],
      },
      {
        title: "Frictionless checkout experience",
        description: "A shopping cart built specifically for book buyers — fast, mobile-friendly, and trustworthy.",
        bullets: [
          "Shopping cart with multi-book checkout",
          "Secure Stripe payment processing (credit/debit cards)",
          "Discount codes and promotional pricing",
          "Reader magnet downloads (free book in exchange for email)",
          "Mobile-optimized checkout on every device",
        ],
      },
      {
        title: "You own the customer relationship",
        description: "Unlike marketplace sales, direct sales give you the reader's email and purchase history.",
        bullets: [
          "Capture reader emails with every purchase and reader magnet",
          "Build your mailing list automatically as you sell",
          "Sales dashboard with revenue tracking and order history",
          "Invoices and tax reporting tools built in",
          "Pair with retailer links — sell direct AND list on Amazon, Kobo, etc.",
        ],
      },
    ],
    faqs: [
      { q: "What payment processor do you use?", a: "AuthorLoft uses Stripe Connect. You connect your own Stripe account, and payments go directly to you. AuthorLoft never touches your money." },
      { q: "What percentage does AuthorLoft take?", a: "Zero. AuthorLoft does not take a cut of your sales. You keep 100% of the revenue minus standard Stripe processing fees (typically 2.9% + 30¢ per transaction)." },
      { q: "Can I still list my books on Amazon and other retailers?", a: "Absolutely. You can add retailer links (Amazon, Kobo, Barnes & Noble, etc.) alongside your direct sales. Many authors do both — direct sales for maximum revenue, retailers for maximum reach." },
      { q: "How do readers get their ebooks after purchase?", a: "Readers receive an instant download link after checkout. Files are delivered securely — readers can download immediately." },
      { q: "Which plan do I need to sell books?", a: "Direct sales require the Standard plan ($19.99/month) or Premium plan ($59.99/month). The Free plan lets you list books with retailer links but not process direct sales." },
    ],
    relatedGuideSlug: "what-is-direct-book-selling",
  },

  "book-marketing-platform": {
    slug: "book-marketing-platform",
    metaTitle: "Book Marketing Platform for Independent Authors",
    metaDescription: "Market your books with AI-powered social media posts, SEO tools, pre-order campaigns, affiliate programs, and bookstore discovery — all in one platform.",
    eyebrow: "Book Marketing",
    heroTitle: <>Market your books <span className="italic text-[#D4AE6A]">like a publishing house</span></>,
    heroSubtitle: "AI social posts, SEO tools, pre-order campaigns, affiliate programs, and bookstore discovery — without the team or the budget.",
    intro: "Independent authors wear every hat — writer, publisher, and marketer. AuthorLoft gives you the same marketing tools that traditional publishing houses use, automated and built into your author platform so you can focus on writing while your marketing works in the background.",
    sections: [
      {
        title: "AI-powered social media promotion",
        description: "Generate platform-ready social posts for any book or topic in seconds.",
        bullets: [
          "Generate posts for Facebook, Instagram, X, LinkedIn, TikTok, Reddit, Threads, and Bluesky",
          "14 promo types: new release, sale, review quote, behind-the-scenes, and more",
          "Your author voice — set your writing style and every post matches your tone",
          "One-click copy with hashtag suggestions",
          "Daily and monthly usage limits by plan — no surprise AI costs",
        ],
      },
      {
        title: "SEO and discoverability tools",
        description: "Get found by readers who are searching for books like yours.",
        bullets: [
          "Built-in SEO audit tool that analyzes your book pages and blog posts",
          "Structured data (Schema.org) automatically added to every page",
          "Blog with RSS feed for content marketing and reader engagement",
          "AuthorLoft Bookstore listing for cross-promotion and genre discovery",
          "Optimized for AI search engines (Google AI Overviews, Perplexity, ChatGPT)",
        ],
      },
      {
        title: "Launch campaigns and growth tools",
        description: "Pre-orders, countdowns, affiliates, and reader magnets to build momentum.",
        bullets: [
          "Pre-order pages with email signup and launch countdown",
          "Affiliate program — let fans earn commission promoting your books",
          "Reader magnets — offer a free book to grow your email list",
          "Discount codes for flash sales and promotions",
          "Specials and featured book sections on your site",
        ],
      },
    ],
    faqs: [
      { q: "What AI model powers the social post generator?", a: "AuthorLoft uses Google's Gemini AI models. Posts are generated with your author voice, book details, and platform-specific formatting built in." },
      { q: "Do I need marketing experience?", a: "No. The tools are designed for authors, not marketers. The AI handles copywriting, the SEO audit tells you exactly what to fix, and the bookstore listing happens automatically." },
      { q: "Can I schedule social media posts?", a: "AuthorLoft generates the post content — you copy it to your social platform of choice. This gives you full control over timing and lets you add your personal touch before posting." },
      { q: "How does the affiliate program work?", a: "Enable affiliates on any book, set a commission percentage, and share referral links. When someone buys through an affiliate link, the commission is tracked automatically." },
      { q: "Is the bookstore listing automatic?", a: "Yes. When you publish a book on AuthorLoft, it's automatically listed in the shared bookstore at authorloft.com/bookstore, organized by genre for reader discovery." },
    ],
    relatedGuideSlug: "what-is-book-launch-marketing",
  },

  "author-newsletter-platform": {
    slug: "author-newsletter-platform",
    metaTitle: "Author Newsletter & Email List Platform",
    metaDescription: "Build your author email list with built-in subscriber forms, reader magnets, and Mailchimp integration. Own your audience — no middleman.",
    eyebrow: "Author Newsletter",
    heroTitle: <>Build an email list that <span className="italic text-[#D4AE6A]">you own</span></>,
    heroSubtitle: "Subscriber capture forms, reader magnets, and newsletter tools — built into your author site, not bolted on.",
    intro: "Social media followers aren't yours — the algorithm decides who sees your posts. Your email list is the one audience asset no platform can take away. AuthorLoft makes it easy to capture subscribers, deliver reader magnets, and send newsletters — all from the same platform where you sell your books.",
    sections: [
      {
        title: "Capture subscribers everywhere",
        description: "Every touchpoint on your site is an opportunity to grow your list.",
        bullets: [
          "Embedded subscribe forms on your homepage, blog, and book pages",
          "Reader magnet delivery — offer a free book in exchange for an email",
          "Pre-order signup forms that capture emails before launch",
          "Contact form submissions added to your audience",
          "Book feedback forms that capture reader emails with reviews",
        ],
      },
      {
        title: "Manage your audience with confidence",
        description: "GDPR-compliant subscriber management with full control over your list.",
        bullets: [
          "Subscriber list management in your admin dashboard",
          "GDPR-compliant opt-in with unsubscribe tokens",
          "Export your list anytime — your data, your subscribers",
          "Segment by source: reader magnet, blog, purchase, pre-order",
          "Mailchimp integration to sync subscribers to your email service",
        ],
      },
      {
        title: "Send newsletters that connect",
        description: "Reach your readers directly — no algorithm filtering your message.",
        bullets: [
          "Send newsletters to your subscriber list from your dashboard",
          "Blog-to-email — share new blog posts directly with subscribers",
          "Author news and updates delivered straight to inboxes",
          "Open rate and delivery tracking",
          "Professional email templates that match your author brand",
        ],
      },
    ],
    faqs: [
      { q: "Does AuthorLoft replace Mailchimp or ConvertKit?", a: "AuthorLoft integrates with Mailchimp and handles subscriber capture natively. You can use AuthorLoft for basic newsletters or sync subscribers to your existing email service for advanced automation." },
      { q: "How do reader magnets work?", a: "Upload a free ebook (or any file), mark it as a reader magnet, and AuthorLoft shows a download button on your book page. Readers enter their email to get the file — automatically added to your subscriber list." },
      { q: "Is the subscriber data GDPR compliant?", a: "Yes. AuthorLoft uses double opt-in tokens, provides unsubscribe links in every email, and lets readers request data deletion. Full GDPR compliance is built in." },
      { q: "Can I export my subscriber list?", a: "Yes. You own your data. Export your full subscriber list anytime from the admin dashboard." },
      { q: "Which plan includes newsletter features?", a: "Subscriber capture is available on all plans (including Free). Sending newsletters and Mailchimp integration require the Standard or Premium plan." },
    ],
    relatedGuideSlug: "what-is-an-author-newsletter",
  },

  "arc-management": {
    slug: "arc-management",
    metaTitle: "ARC Management for Authors — Collect Reviews & Build Your ARC Team",
    metaDescription: "Manage advance reader copies, collect reader reviews, and display approved feedback on your book pages — all built into your author platform.",
    eyebrow: "ARC Management",
    heroTitle: <>Build your ARC team and <span className="italic text-[#D4AE6A]">collect reviews</span></>,
    heroSubtitle: "Manage advance reader copies, collect feedback, and display approved reviews — all from your author dashboard.",
    intro: "Reviews make or break a book launch. AuthorLoft gives you a complete workflow for managing advance reader copies — from distributing ARCs to collecting feedback and displaying approved reviews on your book pages. No spreadsheets, no separate ARC platforms, no extra subscriptions.",
    sections: [
      {
        title: "Collect reader feedback effortlessly",
        description: "A built-in feedback form on every book page makes it easy for ARC readers to leave reviews.",
        bullets: [
          "Public feedback form on every book page — no login required for readers",
          "Star ratings (1–5) with optional written comments",
          "Reviewer name captured with each submission",
          "Email capture with feedback for list building",
          "Spam-resistant — reviews go to your queue, not straight to the page",
        ],
      },
      {
        title: "Moderate and manage with full control",
        description: "Every review goes through your approval queue — you decide what readers see.",
        bullets: [
          "Approval queue in your admin dashboard — approve, reject, or hold",
          "Editorial reviews — add pull quotes from professional reviewers or media",
          "Star ratings and source attribution for each review",
          "Sort and reorder reviews by drag-and-drop priority",
          "Multi-file ARC distribution support",
        ],
      },
      {
        title: "Showcase reviews that sell books",
        description: "Approved reviews display beautifully on your book pages — social proof that converts.",
        bullets: [
          "Reviews render with star ratings, quotes, and reviewer names",
          "Styled to match your site theme and accent color",
          "Aggregate rating calculated automatically for SEO (Schema.org)",
          "Mix editorial reviews and reader feedback in one section",
          "Reviews visible on both your site and the AuthorLoft Bookstore",
        ],
      },
    ],
    faqs: [
      { q: "How do ARC readers submit their reviews?", a: "Every book page has a built-in feedback form. Share your book page link with ARC readers, and they can leave a star rating and comment without creating an account." },
      { q: "Can I add reviews manually?", a: "Yes. You can add editorial reviews (from professional reviewers, bloggers, or media) directly in your admin dashboard with reviewer name, source, rating, and quote." },
      { q: "Do reviews appear automatically?", a: "No. All reader feedback goes to an approval queue in your dashboard. You review each submission and choose whether to approve, reject, or hold it." },
      { q: "Does this replace BookFunnel or StoryOrigin for ARCs?", a: "AuthorLoft handles review collection and display. For ARC file distribution, you can use AuthorLoft's reader magnet feature (free file in exchange for email) or pair with a dedicated ARC distribution service." },
      { q: "Do approved reviews help with SEO?", a: "Yes. Approved reviews generate AggregateRating structured data (Schema.org) on your book pages, which search engines display as star ratings in search results." },
    ],
    relatedGuideSlug: "what-is-an-arc-program",
  },

  "author-media-kit": {
    slug: "author-media-kit",
    metaTitle: "Author Media Kit Generator — Professional Press Kit",
    metaDescription: "Auto-generate a professional author media kit with bio, headshots, book covers, and press-ready assets. Perfect for interviews, podcasts, and events.",
    eyebrow: "Author Media Kit",
    heroTitle: <>A professional press kit, <span className="italic text-[#D4AE6A]">always ready</span></>,
    heroSubtitle: "Auto-generated media kit with your bio, headshots, book covers, and press-ready assets — updated every time you change your profile.",
    intro: "When a podcast host, book blogger, or event organizer wants to feature you, they need your bio, headshot, book covers, and key facts — fast. AuthorLoft auto-generates a polished media kit from your existing profile data, so you always have a professional press kit ready to share.",
    sections: [
      {
        title: "Always up to date, zero maintenance",
        description: "Your media kit pulls from your author profile — update once, reflected everywhere.",
        bullets: [
          "Auto-generated from your bio, headshot, and book catalog",
          "Updates automatically when you change your profile or add books",
          "Shareable link you can send to media contacts",
          "Professional layout designed for press and media use",
          "No design skills needed — it just works",
        ],
      },
      {
        title: "Everything press contacts need",
        description: "All the assets and information a journalist, podcaster, or event organizer needs in one place.",
        bullets: [
          "Author biography — short and long versions",
          "Professional headshot / profile photo",
          "High-resolution book covers for all published titles",
          "Genre, series, and publication details",
          "Social media links and contact information",
        ],
      },
      {
        title: "Built for opportunities",
        description: "A media kit opens doors that a plain email can't.",
        bullets: [
          "Share with podcast hosts, book bloggers, and literary event organizers",
          "Include in pitch emails to reviewers and media outlets",
          "Use for speaking engagement applications",
          "Perfect for bookstore signing requests and conference panels",
          "Professional presentation that builds credibility instantly",
        ],
      },
    ],
    faqs: [
      { q: "What information is included in the media kit?", a: "Your media kit includes your author bio, profile photo, book covers, genre and series information, publication dates, social media links, and contact details — all pulled from your AuthorLoft profile." },
      { q: "Do I need to create the media kit manually?", a: "No. AuthorLoft generates it automatically from your existing profile data. Just keep your profile up to date and your media kit is always ready." },
      { q: "Can I customize what's shown?", a: "The media kit pulls from your public profile. You control what's included by updating your bio, headshot, social links, and book catalog in your admin dashboard." },
      { q: "Which plan includes the media kit?", a: "The media kit is available on the Premium plan ($59.99/month). It's designed for authors who are actively pursuing media coverage and speaking opportunities." },
      { q: "Can I share the media kit with a link?", a: "Yes. Your media kit has a dedicated URL on your author site that you can share with anyone — podcast hosts, event organizers, journalists, or bloggers." },
    ],
    relatedGuideSlug: "what-is-an-author-media-kit",
  },

  "ai-tools-for-authors": {
    slug: "ai-tools-for-authors",
    metaTitle: "AI Tools for Authors — Social Posts, SEO Audit & Writing Assistant",
    metaDescription: "AI-powered tools for independent authors: social media post generator, SEO auditor, writing assistant, and reader feedback analysis. Built for authors, not marketers.",
    eyebrow: "AI Tools for Authors",
    heroTitle: <>AI tools built for <span className="italic text-[#D4AE6A]">authors, not marketers</span></>,
    heroSubtitle: "Generate social posts, audit your SEO, get writing assistance, and analyze reader feedback — all powered by AI, all inside your author dashboard.",
    intro: "AI can save indie authors hours every week — but generic AI tools don't understand the publishing industry. AuthorLoft's AI tools are purpose-built for authors: they know book marketing, understand reader audiences, and speak in your voice. No prompt engineering required.",
    sections: [
      {
        title: "Social Promote — AI social media posts in seconds",
        description: "Generate platform-ready social posts for any book, topic, or promotion type.",
        bullets: [
          "8 platforms: Facebook, Instagram, X, LinkedIn, TikTok, Reddit, Threads, Bluesky",
          "14 promo types: new release, sale, review quote, countdown, behind-the-scenes",
          "Set your author voice — every post matches your writing style",
          "Hashtag suggestions with click-to-remove editing",
          "Character count validation per platform",
          "One-click copy to clipboard",
        ],
      },
      {
        title: "SEO Audit — find and fix discoverability issues",
        description: "A built-in SEO tool that analyzes your book pages and blog posts for search engine optimization.",
        bullets: [
          "Page-by-page SEO analysis with actionable recommendations",
          "Meta title and description optimization suggestions",
          "Content structure and heading hierarchy checks",
          "Image alt text and accessibility review",
          "Focus keyword tracking and density analysis",
        ],
      },
      {
        title: "AI Writing Assistant and more",
        description: "Additional AI capabilities to help you work smarter, not harder.",
        bullets: [
          "AI writing assistant for blog posts, book descriptions, and marketing copy",
          "Reader feedback analysis — spot patterns across reader reviews",
          "All AI features use Google's Gemini models for high-quality output",
          "Usage limits by plan so you never face surprise costs",
          "Super Admin controls: model selection, cost ceilings, and kill switches",
        ],
      },
    ],
    faqs: [
      { q: "Which AI model does AuthorLoft use?", a: "AuthorLoft uses Google's Gemini AI models (Flash, Flash Lite, and Pro). The platform admin can configure which model is used to balance quality and cost." },
      { q: "Will AI-generated posts sound like me?", a: "Yes. You set your author voice description (up to 500 characters) in the Promote settings. Every generated post is flavored with your voice, tone, and style." },
      { q: "Are there limits on AI usage?", a: "Yes. Standard plan includes a daily and monthly generation limit. Premium plan has higher limits. Exact limits are set by the platform administrator and shown in your dashboard." },
      { q: "Do I need to know how to write AI prompts?", a: "No. AuthorLoft handles all prompt engineering behind the scenes. You just pick your book, choose a platform and promo type, and click Generate." },
      { q: "Which plan includes AI tools?", a: "AI tools are available on Standard ($19.99/month) and Premium ($59.99/month) plans. The Free plan does not include AI features." },
    ],
  },

  "indie-author-bookstore": {
    slug: "indie-author-bookstore",
    metaTitle: "Indie Author Bookstore — Discover & Sell Independent Books",
    metaDescription: "A curated bookstore for independent authors. List your books, get discovered by genre, and reach new readers through AuthorLoft's shared catalog.",
    eyebrow: "Indie Bookstore",
    heroTitle: <>A bookstore where <span className="italic text-[#D4AE6A]">indie authors are the stars</span></>,
    heroSubtitle: "List your books in a shared catalog, get discovered by genre, and reach readers who are actively looking for their next favorite indie author.",
    intro: "Visibility is the #1 challenge for independent authors. AuthorLoft's shared Bookstore at authorloft.com/bookstore puts your books in front of readers who are specifically looking for indie authors — organized by genre, sorted by popularity, and linked directly to your author site where you make the sale.",
    sections: [
      {
        title: "Automatic listing, zero extra work",
        description: "Publish a book on AuthorLoft and it appears in the bookstore. No separate submissions, no approval queues.",
        bullets: [
          "Books are listed automatically when you publish them",
          "Cover image, title, author name, genre, and description displayed",
          "Links directly to your book page on your author site",
          "Genre-based browsing so readers find books they'll love",
          "Trending section based on book views and reader interest",
        ],
      },
      {
        title: "Cross-promotion that benefits everyone",
        description: "When one author brings readers to the bookstore, every listed author benefits from the traffic.",
        bullets: [
          "Shared catalog means more eyeballs on your books",
          "Genre landing pages rank for searches like 'indie romance books' or 'self-published thriller'",
          "Each genre page has its own SEO-optimized metadata",
          "Readers can browse by genre, search by title, or discover trending titles",
          "Your books appear alongside other quality indie titles — credibility by association",
        ],
      },
      {
        title: "Built for reader discovery",
        description: "The bookstore is designed to help readers find their next great read — and your book is in the mix.",
        bullets: [
          "Search functionality to find books by title or author",
          "Genre categories maintained by the platform team",
          "Mobile-friendly browsing experience",
          "Structured data for search engine visibility",
          "Reader can click through to your full book page with reviews, excerpts, and buy options",
        ],
      },
    ],
    faqs: [
      { q: "Is the bookstore listing free?", a: "Bookstore listing is included on Standard and Premium plans. Free plan authors can list their books with external retailer links but direct sales require a paid plan." },
      { q: "Do I control how my books appear?", a: "Yes. Your book's title, cover, description, and genre are pulled from your book catalog. Update them in your admin dashboard and the bookstore listing updates automatically." },
      { q: "Can readers buy books directly from the bookstore?", a: "The bookstore links to your book page on your author site, where readers can purchase directly from you (if you have direct sales enabled) or click through to retailer links." },
      { q: "How are 'trending' books determined?", a: "Trending is based on book page views. The more readers visit your book page, the higher it appears in the trending section." },
      { q: "Is the bookstore separate from my author site?", a: "Yes. The bookstore lives at authorloft.com/bookstore and is a shared catalog for all AuthorLoft authors. Your author site is your own dedicated website with your branding, domain, and full book pages." },
    ],
  },

  "book-pre-orders": {
    slug: "book-pre-orders",
    metaTitle: "Book Pre-Order Pages for Authors — Countdown, Signups & Launch",
    metaDescription: "Create pre-order pages with launch countdowns, email signups, and automatic notifications. Build anticipation and capture readers before your book drops.",
    eyebrow: "Book Pre-Orders",
    heroTitle: <>Build anticipation <span className="italic text-[#D4AE6A]">before launch day</span></>,
    heroSubtitle: "Pre-order pages with launch countdowns, email signups, and automatic reader notifications — turn your launch into an event.",
    intro: "The weeks before a book launch are the most critical marketing window you'll have. AuthorLoft's pre-order system lets you capture reader interest, build your email list, and create urgency with countdown timers — all before your book is even available. When launch day arrives, your audience is already waiting.",
    sections: [
      {
        title: "Pre-order pages that build excitement",
        description: "Turn your upcoming release into a landing page that captures attention and emails.",
        bullets: [
          "Dedicated pre-order page for each upcoming book",
          "Email signup form — readers register for launch notification",
          "Launch countdown timer with customizable date",
          "Book cover, description, and excerpt preview",
          "Automatically switches to a buy page when the book launches",
        ],
      },
      {
        title: "Capture your launch audience",
        description: "Every pre-order signup is a reader who wants your book — and an email you own.",
        bullets: [
          "Email addresses captured and added to your subscriber list",
          "Segment pre-order signups separately from other subscribers",
          "Notify registered readers automatically on launch day",
          "Build social proof — show interest before the book is live",
          "Pair with reader magnets for even higher conversion",
        ],
      },
      {
        title: "Launch with momentum",
        description: "When your book goes live, you already have an audience ready to buy.",
        bullets: [
          "Set your launch date and let the countdown do the work",
          "Share pre-order links on social media and newsletters",
          "Launch notification drives first-day sales",
          "Reviews from ARC readers ready before launch",
          "Affiliate links active for launch-day promotion",
        ],
      },
    ],
    faqs: [
      { q: "How do I set up a pre-order page?", a: "In your book editor, toggle 'Pre-Order' on and set a pre-order date. AuthorLoft automatically creates a pre-order page with an email signup form and optional countdown timer." },
      { q: "What happens when the launch date arrives?", a: "The pre-order page automatically transitions to a normal book page with buy options. Registered readers receive a notification that the book is now available." },
      { q: "Can I show a countdown timer?", a: "Yes. Enable the 'Show Countdown' option and set your launch date. A live countdown timer displays on the book page, creating urgency and excitement." },
      { q: "Do pre-order signups go to my email list?", a: "Yes. Every email captured through the pre-order form is added to your subscriber list, so you can continue marketing to these readers after launch." },
      { q: "Which plan includes pre-orders?", a: "Pre-order pages are available on Standard and Premium plans." },
    ],
    relatedGuideSlug: "what-is-book-launch-marketing",
  },

  "author-affiliate-program": {
    slug: "author-affiliate-program",
    metaTitle: "Author Affiliate Program — Let Fans Sell Your Books",
    metaDescription: "Built-in affiliate program for authors. Let book bloggers, fans, and influencers earn commission promoting your books with tracked referral links.",
    eyebrow: "Affiliate Program",
    heroTitle: <>Let your biggest fans <span className="italic text-[#D4AE6A]">sell for you</span></>,
    heroSubtitle: "Built-in affiliate program with tracked referral links, customizable commissions, and automatic attribution — turn readers into your sales team.",
    intro: "Your most passionate readers are already recommending your books to friends. AuthorLoft's built-in affiliate program gives them a reason to promote even harder — and gives you a scalable way to reach new readers through word-of-mouth marketing that actually pays for itself.",
    sections: [
      {
        title: "Simple setup, powerful results",
        description: "Enable affiliates on any book and set your commission — AuthorLoft handles the rest.",
        bullets: [
          "Per-book affiliate toggle — choose which books have affiliate links",
          "Customizable commission percentage per book",
          "Unique referral links generated automatically",
          "Cookie-based tracking ensures the referring affiliate gets credit",
          "Works with both direct sales and reader magnet downloads",
        ],
      },
      {
        title: "Grow your reach through advocacy",
        description: "Book bloggers, BookTok creators, and superfans become your marketing team.",
        bullets: [
          "Share affiliate links with book bloggers and reviewers",
          "BookTok and Bookstagram creators can monetize their recommendations",
          "Fans who love your books earn rewards for spreading the word",
          "No limit on the number of affiliates per book",
          "Affiliate tracking dashboard in your admin panel",
        ],
      },
      {
        title: "Transparent tracking",
        description: "See every referral, every click, and every conversion — no black boxes.",
        bullets: [
          "Referral tracking with click and conversion data",
          "Attribution tied to the referring affiliate's link",
          "Commission tracking per affiliate and per book",
          "Transparent reporting for both you and your affiliates",
          "All data accessible from your sales dashboard",
        ],
      },
    ],
    faqs: [
      { q: "How do I enable the affiliate program?", a: "In your book editor, toggle 'Affiliate Enabled' and set a commission percentage. AuthorLoft generates unique referral links that affiliates can share." },
      { q: "How do affiliates get their links?", a: "Affiliate referral links are generated with a tracking parameter. You share these links with your affiliates — book bloggers, fans, or influencers." },
      { q: "What commission percentage should I set?", a: "Most authors set 10–20% commission. The default is 10%. You can set different percentages for different books based on your margins and marketing goals." },
      { q: "How does tracking work?", a: "When a reader clicks an affiliate link, a cookie is set. If that reader purchases the book, the sale is attributed to the referring affiliate. The commission is tracked automatically." },
      { q: "Which plan includes the affiliate program?", a: "The affiliate program is available on Standard and Premium plans with direct sales enabled." },
    ],
    relatedGuideSlug: "what-is-an-author-affiliate-program",
  },

  "reader-analytics-for-authors": {
    slug: "reader-analytics-for-authors",
    metaTitle: "Reader Analytics for Authors — Understand Your Audience",
    metaDescription: "PostHog-powered analytics for independent authors. Track page views, book popularity, reader behavior, and audience growth — all from your dashboard.",
    eyebrow: "Reader Analytics",
    heroTitle: <>Understand your readers <span className="italic text-[#D4AE6A]">like never before</span></>,
    heroSubtitle: "Know which books get the most attention, where your readers come from, and how they engage with your site — powered by PostHog analytics.",
    intro: "Most indie authors are marketing blind — they publish books and hope for the best. AuthorLoft's reader analytics give you real data on what's working: which books attract the most views, which blog posts drive traffic, where your readers come from, and how they move through your site. Data-driven decisions replace guesswork.",
    sections: [
      {
        title: "Book and page performance",
        description: "See exactly which content resonates with your audience.",
        bullets: [
          "Page views per book, blog post, and site section",
          "Book popularity rankings based on reader views",
          "Trending books identified automatically",
          "Traffic sources — where your readers are coming from",
          "Time on page and engagement metrics",
        ],
      },
      {
        title: "Audience insights",
        description: "Understand who your readers are and how they find you.",
        bullets: [
          "Geographic distribution of your audience",
          "Device and browser breakdown (desktop vs. mobile)",
          "Referral tracking — social media, search, direct, and bookstore",
          "New vs. returning visitor patterns",
          "Peak activity times and days",
        ],
      },
      {
        title: "Growth tracking",
        description: "Watch your author platform grow over time with clear metrics.",
        bullets: [
          "Subscriber growth trends",
          "Sales and revenue tracking (with direct sales)",
          "Book view trends over time",
          "Campaign performance — see spikes from promotions",
          "All data accessible from your AuthorLoft admin dashboard",
        ],
      },
    ],
    faqs: [
      { q: "What analytics platform does AuthorLoft use?", a: "AuthorLoft uses PostHog, a privacy-friendly analytics platform. Analytics data is collected on your author site and accessible through your admin dashboard." },
      { q: "Is reader data privacy-compliant?", a: "Yes. PostHog is GDPR-compliant and AuthorLoft's analytics respect reader privacy. No personally identifiable information is shared with third parties." },
      { q: "Which plan includes analytics?", a: "Reader analytics are available on Standard ($19.99/month) and Premium ($59.99/month) plans. The Free plan does not include analytics." },
      { q: "Can I see which social media posts drive the most traffic?", a: "Yes. The referral tracking shows which traffic sources (social platforms, search engines, direct visits, bookstore) send readers to your site and specific book pages." },
      { q: "Do I need to install any tracking code?", a: "No. Analytics are built into your AuthorLoft site automatically. No code snippets, no pixel setup, no third-party accounts to configure." },
    ],
    relatedGuideSlug: "what-is-reader-analytics-for-authors",
  },

  "author-courses": {
    slug: "author-courses",
    metaTitle: "Sell Online Courses — Teach What You Know",
    metaDescription: "Build and sell online courses from your own site. Modules, lessons, video, worksheets, and Stripe checkout — you keep 100% of every sale.",
    eyebrow: "Author Courses",
    heroTitle: <>Your expertise is worth more than <span className="italic text-[#D4AE6A]">one more book sale</span></>,
    heroSubtitle: "Build a course from the knowledge you already have, host it on your own site, and sell it direct — no course-platform cut, no separate login for your students.",
    intro: "Every author knows something worth teaching, whether it's the craft itself or the subject matter behind the books. A course turns that knowledge into income that doesn't depend on your next release. AuthorLoft courses live on your own site, next to your books, sold through your own Stripe account — so a reader who trusts your writing can buy your teaching without ever leaving your world.",
    sections: [
      {
        title: "Structure a real course, not a PDF",
        description: "Organize your material into modules and lessons, with the media each lesson actually needs.",
        bullets: [
          "Course → module → lesson structure, reorderable as you build",
          "Rich text lessons with headings, lists, images, and links",
          "Embed video from YouTube, Vimeo, or any external host",
          "Attach a downloadable worksheet, slide deck, or cheat sheet per lesson",
          "Save as a draft and publish only when the whole thing is ready",
        ],
      },
      {
        title: "Sell it your way",
        description: "Free, paid, or discounted — with the money going straight to your account.",
        bullets: [
          "One-time purchase through your own Stripe account, no platform fee",
          "Offer a course free to grow your email list instead of your revenue",
          "Discount codes for launches, bundles, and newsletter subscribers",
          "Every student is captured as a subscriber you own and can email",
          "You're notified on every enrollment, free or paid",
        ],
      },
      {
        title: "A student experience you control",
        description: "Enrolled students get a real learning environment, not a folder of links.",
        bullets: [
          "Dedicated lesson viewer with module-by-module progress",
          "Access tied to enrollment — no shared links, no leaked content",
          "Students can print or save the full course for offline reference",
          "Optional listing in the AuthorLoft Bookstore to reach new students",
          "Course categories and star ratings help the right students find you",
        ],
      },
    ],
    faqs: [
      { q: "How is this different from Teachable or Thinkific?", a: "Your course lives on your own author site, at your own domain, alongside your books — and payment goes directly to your Stripe account with no platform commission. Students don't create an account on someone else's platform to reach your material." },
      { q: "Can I import a course I've already built?", a: "Yes. The bulk course importer accepts a CSV with one row per lesson and builds the full module and lesson structure for you, landing as an unpublished draft you can review before going live." },
      { q: "Can I host video lessons?", a: "Courses embed video from external hosts like YouTube and Vimeo, including unlisted videos. AuthorLoft doesn't host video files directly, which keeps your storage free for the downloadable resources that accompany your lessons." },
      { q: "Can I give a course away for free?", a: "Yes. A free course is one of the strongest email-list builders available — students enroll with their email address and are added to your subscriber list the same way a paid buyer is." },
      { q: "Which plan includes courses?", a: "Courses are available on Standard (up to 20 courses) and Premium (unlimited). The Free plan includes up to 5 courses." },
    ],
  },
};

export const LANDING_PAGE_SLUGS = Object.keys(LANDING_PAGES);
