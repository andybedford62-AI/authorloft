import { getServerSession }      from "next-auth";
import { redirect, notFound }    from "next/navigation";
import { authOptions }           from "@/lib/auth";
import { prisma }                from "@/lib/db";
import { SocialPostForm }        from "@/components/super-admin/social-post-form";

export default async function EditSocialPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const { id } = await params;

  const [post, tokens] = await Promise.all([
    prisma.socialPost.findUnique({ where: { id } }),
    prisma.socialPlatformToken.findMany({
      where:   { isActive: true },
      orderBy: { platform: "asc" },
      select:  { platform: true, accountName: true, isActive: true },
    }),
  ]);

  if (!post) notFound();

  if (!["DRAFT", "SCHEDULED"].includes(post.status)) {
    redirect("/super-admin/social");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{post.caption.slice(0, 80)}</p>
      </div>
      <SocialPostForm tokens={tokens} post={post as any} />
    </div>
  );
}
