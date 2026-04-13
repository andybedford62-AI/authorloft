import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/post-form";
import { BlogDeleteButton } from "@/components/admin/blog-delete-button";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const authorId = (session.user as any).id as string;
  const { id } = await params;

  const post = await prisma.post.findFirst({
    where: { id, authorId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      isPublished: true,
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">/blog/{post.slug}</p>
        </div>

        <div className="pt-8">
          <BlogDeleteButton
            postId={post.id}
            postTitle={post.title}
            redirectTo="/admin/blog"
          />
        </div>
      </div>

      <PostForm post={post} />
    </div>
  );
}
