import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { PostForm } from "@/components/admin/post-form";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="text-sm text-gray-500 mt-1">Write a new blog post or news update for your readers.</p>
      </div>

      <PostForm />
    </div>
  );
}
