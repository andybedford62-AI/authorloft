import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppearanceClient } from "./appearance-client";

export default async function AppearancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      homeTemplate: true,
      siteTheme:    true,
      slug:         true,
      plan:         { select: { tier: true } },
    },
  });

  if (!author) redirect("/login");

  const tier = author.plan?.tier ?? "FREE";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customise the look and feel of your author site — choose a layout template and a colour theme.
        </p>
      </div>
      <AppearanceClient
        currentTemplate={author.homeTemplate ?? "classic"}
        currentTheme={author.siteTheme ?? "classic-literary"}
        authorSlug={author.slug}
        planTier={tier}
      />
    </div>
  );
}
