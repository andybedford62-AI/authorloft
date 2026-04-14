import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AuthorNav } from "@/components/author-site/nav";
import { AuthorFooter } from "@/components/author-site/footer";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import type { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL(
//     process.env.NEXT_PUBLIC_APP_URL ?? "https://authorloft.app"
//   ),
// };

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
      accentColor: true,
      profileImageUrl: true,
      linkedinUrl: true,
      youtubeUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      instagramUrl: true,
      contactEmail: true,
      // Nav visibility toggles
      navShowAbout: true,
      navShowBooks: true,
      navShowSpecials: true,
      navShowFlipBooks: true,
      navShowBlog: true,
      navShowContact: true,
      isActive: true,
      plan: {
        select: { flipBooksLimit: true },
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
    alternates: {
      canonical: baseUrl,
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
  if (!author) notFound();

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
  };

  return (
    <AdminSessionProvider>
      <div style={{ "--accent": author.accentColor || "#7B2D2D" } as React.CSSProperties}>
        <AuthorNav
          author={author}
          navConfig={navConfig}
          customPages={customNavPages}
        />
        <main className="min-h-screen">{children}</main>
        <AuthorFooter author={author} navConfig={navConfig} customPages={customNavPages} />
      </div>
    </AdminSessionProvider>
  );
}
