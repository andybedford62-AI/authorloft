import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AppearanceClient } from "./appearance-client";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function AppearancePage() {
  const authorId = await getAdminAuthorId();

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      siteTheme: true,
      slug:      true,
      plan:      { select: { tier: true } },
    },
  });

  if (!author) redirect("/login");

  const tier = author.plan?.tier ?? "FREE";

  // FREE authors have no theme choice — redirect to branding
  if (tier === "FREE") redirect("/admin/branding");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a colour theme for your author site. Changes apply instantly to all visitors.
        </p>
      </div>
      <AppearanceClient
        currentTheme={author.siteTheme ?? "classic-literary"}
        authorSlug={author.slug}
        planTier={tier}
      />
    </div>
  );
}
