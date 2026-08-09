import { getServerSession }      from "next-auth";
import { redirect }              from "next/navigation";
import { authOptions }           from "@/lib/auth";
import { prisma }                from "@/lib/db";
import { SocialPostForm }        from "@/components/super-admin/social-post-form";

export default async function NewSocialPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const tokens = await prisma.socialPlatformToken.findMany({
    where:   { isActive: true },
    orderBy: { platform: "asc" },
    select:  { platform: true, accountName: true, isActive: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Social Post</h1>
        <p className="text-sm text-gray-500 mt-1">Create a post for AuthorLoft&apos;s social accounts.</p>
      </div>
      <SocialPostForm tokens={tokens} />
    </div>
  );
}
