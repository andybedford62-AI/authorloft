import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MediaKitForm } from "@/components/admin/media-kit-form";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { Megaphone, ExternalLink } from "lucide-react";

export const metadata = { title: "Media Kit" };

export default async function AdminMediaKitPage() {
  const authorId = await getAdminAuthorId();

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: {
      slug:            true,
      displayName:     true,
      name:            true,
      profileImageUrl: true,
      pressTitle:      true,
      pressBio:        true,
      pressContact:    true,
      plan: { select: { mediaKitEnabled: true, tier: true } },
    },
  });

  if (!author) redirect("/login");

  if (!author.plan?.mediaKitEnabled) {
    const tierLabel = author.plan?.tier === "FREE" ? "Standard or Premium" : "a higher plan";
    return (
      <div className="max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Media Kit</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <p className="text-sm font-semibold text-amber-800">Standard plan required</p>
          <p className="text-sm text-amber-700">
            A professional media kit page — with downloadable author photo, press biography,
            and book covers — is available on {tierLabel}.
          </p>
          <Link
            href="/admin/settings#billing"
            className="inline-block mt-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Upgrade your plan
          </Link>
        </div>
      </div>
    );
  }

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const publicUrl = `https://${author.slug}.${platformDomain}/media-kit`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-gray-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Kit</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your public press page for journalists, podcast hosts, and event organizers.
            </p>
          </div>
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
        >
          View public page <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <MediaKitForm
        initialData={{
          pressTitle:      author.pressTitle,
          pressBio:        author.pressBio,
          pressContact:    author.pressContact,
          profileImageUrl: author.profileImageUrl,
          displayName:     author.displayName,
          name:            author.name,
        }}
      />
    </div>
  );
}
