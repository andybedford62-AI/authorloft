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
    select: { homeTemplate: true, slug: true },
  });

  if (!author) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a homepage template that fits your style. Changes apply to your live site instantly.
        </p>
      </div>
      <AppearanceClient
        currentTemplate={author.homeTemplate ?? "classic"}
        authorSlug={author.slug}
      />
    </div>
  );
}
