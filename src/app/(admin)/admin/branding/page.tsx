import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BrandingForm } from "@/components/admin/branding-form";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function BrandingPage() {
  const authorId = await getAdminAuthorId();

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      displayName: true, tagline: true, shortBio: true, bio: true,
      profileImageUrl: true,
      logoUrl: true,
      linkedinUrl: true, youtubeUrl: true, facebookUrl: true,
      twitterUrl: true, instagramUrl: true,
      contactEmail: true, contactResponseTime: true, contactOpenTo: true,
      heroTitle: true, heroSubtitle: true,
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
    profileImageUrl: author.profileImageUrl ?? "",
    logoUrl:         author.logoUrl         ?? "",
    linkedinUrl:    author.linkedinUrl    ?? "",
    youtubeUrl:     author.youtubeUrl     ?? "",
    facebookUrl:    author.facebookUrl    ?? "",
    twitterUrl:     author.twitterUrl     ?? "",
    instagramUrl:   author.instagramUrl   ?? "",
    contactEmail:        author.contactEmail        ?? "",
    contactResponseTime: author.contactResponseTime ?? "",
    contactOpenTo:       author.contactOpenTo       ?? "",
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
