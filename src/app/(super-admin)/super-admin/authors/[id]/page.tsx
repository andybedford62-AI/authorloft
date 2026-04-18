import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AuthorEditForm } from "./author-edit-form";

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const { id } = await params;

  const [author, plans] = await Promise.all([
    prisma.author.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        slug: true,
        customDomain: true,
        bio: true,
        shortBio: true,
        tagline: true,
        contactEmail: true,
        isActive: true,
        isSuperAdmin: true,
        planId: true,
        createdAt: true,
        updatedAt: true,
        aiUsageCount: true,
        aiUsageCap: true,
        aiUsageResetAt: true,
        aiApiKey: true,
        plan: { select: { id: true, name: true, tier: true } },
        _count: {
          select: { books: true, subscribers: true, orders: true, posts: true },
        },
      },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      select: { id: true, name: true, tier: true, monthlyPriceCents: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!author) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/super-admin/authors"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Authors
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-700 flex-shrink-0">
            {(author.displayName || author.name)[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {author.displayName || author.name}
            </h1>
            <p className="text-sm text-gray-400">{author.email}</p>
            <p className="text-xs text-blue-500 mt-0.5">{author.slug}.authorloft.com</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-4 text-center">
          {[
            { label: "Books",       value: author._count.books       },
            { label: "Posts",       value: author._count.posts       },
            { label: "Subscribers", value: author._count.subscribers },
            { label: "Orders",      value: author._count.orders      },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-[72px]">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata row */}
      <div className="text-xs text-gray-400 flex gap-4 flex-wrap">
        <span>Joined {new Date(author.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        <span>Last updated {new Date(author.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        {author.isSuperAdmin && (
          <span className="text-purple-600 font-medium">Super Admin account</span>
        )}
      </div>

      {/* Edit form */}
      <AuthorEditForm
        author={author}
        plans={plans}
        aiUsageCount={author.aiUsageCount}
        aiUsageCap={author.aiUsageCap}
        aiUsageResetAt={author.aiUsageResetAt}
        hasOwnKey={!!author.aiApiKey}
      />
    </div>
  );
}
