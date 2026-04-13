import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus, Pencil, Newspaper, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { BlogDeleteButton } from "@/components/admin/blog-delete-button";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const authorId = (session.user as any).id as string;

  const posts = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog / News</h1>
          <p className="text-sm text-gray-500 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} — keep your readers updated with announcements, news, and stories.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Newspaper className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No posts yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Write your first post to share news, announcements, or behind-the-scenes updates with readers.
          </p>
          <Link href="/admin/blog/new">
            <Button>Write Your First Post</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Post
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                  Date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">

                  {/* Title + excerpt */}
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Newspaper className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 leading-snug">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-sm">{post.excerpt}</p>
                        )}
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/blog/{post.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    {post.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : `Created ${new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/blog/${post.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                      </Link>
                      <BlogDeleteButton postId={post.id} postTitle={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info note about enabling in nav */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
        <strong>Tip:</strong> Enable the Blog link in your site navigation from{" "}
        <Link href="/admin/pages" className="underline hover:text-blue-900">
          Pages &amp; Navigation
        </Link>
        .
      </div>
    </div>
  );
}
