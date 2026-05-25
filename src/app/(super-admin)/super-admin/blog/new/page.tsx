import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PlatformPostForm } from "@/components/super-admin/platform-post-form";

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Blog Post</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new post for the AuthorLoft platform blog.</p>
      </div>
      <PlatformPostForm />
    </div>
  );
}
