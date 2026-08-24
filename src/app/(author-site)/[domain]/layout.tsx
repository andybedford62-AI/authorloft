import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { redirectIfRetiredSlug } from "@/lib/author-queries";
import { AuthorNav } from "@/components/author-site/nav";
import { AuthorFooter } from "@/components/author-site/footer";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { getTheme, resolveAccentColor, isThemeAllowed } from "@/lib/themes";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { CartProvider } from "@/context/cart-context";
import { CartDrawer } from "@/components/author-site/cart-drawer";
import { DemoBanner } from "@/components/demo-banner";
import type { Metadata } from "next";

// Always fetch fresh data — ensures branding/content changes appear immediately
export const dynamic = "force-dynamic";

async function resolveAuthor(domain: string) {
  return prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      slug: true,
      customDomain: true,
      shortBio: true,
      profileImageUrl: true,
      logoUrl: true,
      linkedinUrl: true,
      youtubeUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      instagramUrl: true,
      supportUrl: true,
      contactEmail: true,
      // Nav visibility toggles
      navShowAbout: true,
      navShowBooks: true,
      navShowSpecials: true,
      navShowFlipBooks: true,
      navShowBlog: true,
      navShowContact: true,
      navShowMediaKit: true,
      navShowBookstore: true,
      navShowBundles: true,
      navShowCourses: true,
      navShowMusic: true,
      googleSiteVerification: true,
      bingSiteVerification: true,
      siteTheme: true,
      homeTemplate: true,
      customAccentColor: true,
      isActive: true,
      plan: {
        select: { flipBooksLimit: true, tier: true, mediaKitEnabled: true, salesEnabled: true, bundlesEnabled: true, coursesEnabled: true, musicEnabled: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await resolveAuthor(domain);
  if (!author) return { title: "Author Not Found" };

  const authorName = author.displayName || author.name;
  const description = author.shortBio || `Books and stories by ${authorName}.`;
  const baseUrl = getAuthorBaseUrl(author);
  const ogImages = author.profileImageUrl
    ? [{ url: author.profileImageUrl, alt: authorName }]
    : [];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: authorName,
      template: `%s | ${authorName}`,
    },
    description,
    icons: { icon: "/authorloft-logo.png" },
    openGraph: {
      type: "website",
      siteName: authorName,
      title: authorName,
      description,
      url: baseUrl,
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title: authorName,
      description,
      ...(ogImages.length > 0 && { images: [ogImages[0].url] }),
    },
    // No `alternates.canonical` here on purpose. Next merges layout metadata
    // into every page below it, so a canonical set at this level cascades to
    // each page that doesn't override it — which meant /about, /books,
    // /contact, /flip-books and the rest all declared the site root as their
    // canonical and told Google they were duplicates of the homepage, while
    // the sitemap was busy submitting them as distinct URLs. Each page now
    // sets its own; anything that shouldn't be indexed sets robots.index
    // false instead.
    verification: {
      ...(author.googleSiteVerification && {
        google: author.googleSiteVerification,
      }),
      ...(author.bingSiteVerification && {
        other: { "msvalidate.01": author.bingSiteVerification },
      }),
    },
  };
}

export default async function AuthorSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await resolveAuthor(domain);
  if (!author) {
    // Layout renders before any child page, so this is the one place that
    // actually needs the retired-slug check — page.tsx's own copy (in
    // getAuthorByDomain) never gets reached if this notFound() fires first.
    await redirectIfRetiredSlug(domain);
    notFound();
  }

  // Fetch custom pages that are published AND set to show in nav
  const customNavPages = await prisma.authorPage.findMany({
    where: {
      authorId: author.id,
      isVisible: true,
      showInNav: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      slug: true,
      title: true,
      navTitle: true,
    },
  });

  const navConfig = {
    navShowAbout: author.navShowAbout,
    navShowBooks: author.navShowBooks,
    navShowSpecials: author.navShowSpecials,
    navShowFlipBooks: author.navShowFlipBooks,
    navShowBlog: author.navShowBlog,
    navShowContact: author.navShowContact,
    navShowMediaKit: author.navShowMediaKit,
    navShowBookstore: author.navShowBookstore,
    navShowBundles: author.navShowBundles,
    navShowCourses: author.navShowCourses,
    navShowMusic: author.navShowMusic,
  };

  // Enforce plan-based theme access at render time
  const planTier = author.plan?.tier ?? "FREE";
  const effectiveSiteTheme = isThemeAllowed(author.siteTheme, planTier)
    ? author.siteTheme
    : planTier === "FREE" ? "modern-minimal" : "classic-literary";

  const theme = getTheme(effectiveSiteTheme);
  const dataTheme = theme.dataTheme || undefined;

  // Accent: PREMIUM authors may override with a custom colour; otherwise use theme accent.
  const accentColor = resolveAccentColor({
    planTier,
    customAccentColor: author.customAccentColor,
    siteTheme: effectiveSiteTheme,
  });
  const authorWithAccent = { ...author, accentColor };

  const baseUrl = getAuthorBaseUrl(author);
  const authorName = author.displayName || author.name;
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: authorName,
    url: baseUrl,
    description: author.shortBio || `Books and stories by ${authorName}.`,
    publisher: {
      "@type": "Person",
      name: authorName,
      url: baseUrl,
      ...(author.profileImageUrl && { image: author.profileImageUrl }),
    },
  };

  return (
    <AdminSessionProvider>
      <CartProvider>
        <div
          data-theme={dataTheme}
        >
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
          <DemoBanner />
          <AuthorNav
            author={authorWithAccent}
            navConfig={navConfig}
            customPages={customNavPages}
          />
          <CartDrawer />
          <main className="min-h-screen">{children}</main>
          <AuthorFooter author={authorWithAccent} navConfig={navConfig} customPages={customNavPages} />
        </div>
      </CartProvider>
    </AdminSessionProvider>
  );
}
