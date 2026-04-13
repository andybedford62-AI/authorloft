import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BrandingForm } from "@/components/admin/branding-form";

export default async function BrandingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      displayName: true, tagline: true, shortBio: true, bio: true,
      accentColor: true, profileImageUrl: true,
      linkedinUrl: true, youtubeUrl: true, facebookUrl: true,
      twitterUrl: true, instagramUrl: true,
      contactEmail: true, heroTitle: true, heroSubtitle: true,
      showHeroBanner: true,
      aboutStats: true,
      credentials: true,
    },
  });

  if (!author) redirect("/login");

  const initial = {
    displayName:    author.displayName    ?? "",
    tagline:        author.tagline        ?? "",
    shortBio:       author.shortBio       ?? "",
    bio:            author.bio            ?? "",
    accentColor:    author.accentColor    ?? "#7B2D2D",
    profileImageUrl: author.profileImageUrl ?? "",
    linkedinUrl:    author.linkedinUrl    ?? "",
    youtubeUrl:     author.youtubeUrl     ?? "",
    facebookUrl:    author.facebookUrl    ?? "",
    twitterUrl:     author.twitterUrl     ?? "",
    instagramUrl:   author.instagramUrl   ?? "",
    contactEmail:   author.contactEmail   ?? "",
    heroTitle:      author.heroTitle      ?? "",
    heroSubtitle:   author.heroSubtitle   ?? "",
    showHeroBanner: author.showHeroBanner ?? true,
    aboutStats: Array.isArray(author.aboutStats)
      ? (author.aboutStats as { value: string; label: string }[])
      : [],
    credentials: Array.isArray(author.credentials)
      ? (author.credentials as string[]).slice(0, 3)
      : ["", "", ""],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Branding</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your photo, bio, and how your author site looks and feels.
        </p>
      </div>
      <BrandingForm initial={initial} />
    </div>
  );
}
