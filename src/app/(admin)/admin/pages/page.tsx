import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { NavSettingsPanel } from "@/components/admin/nav-settings-panel";
import { PagesListClient } from "@/components/admin/pages-list-client";
import { Plus, FileText } from "lucide-react";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function AdminPagesPage() {
  const authorId = await getAdminAuthorId();

  const [author, pages] = await Promise.all([
    prisma.author.findUnique({
      where: { id: authorId },
      select: {
        navShowAbout: true,
        navShowBooks: true,
        navShowSpecials: true,
        navShowFlipBooks: true,
        navShowBlog: true,
        navShowContact: true,
        plan: { select: { flipBooksLimit: true } },
      },
    }),
    prisma.authorPage.findMany({
      where: { authorId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        navTitle: true,
        isVisible: true,
        showInNav: true,
        sortOrder: true,
        updatedAt: true,
      },
    }),
  ]);

  if (!author) redirect("/login");

  const navSettings = {
    navShowAbout: author.navShowAbout,
    navShowBooks: author.navShowBooks,
    navShowSpecials: author.navShowSpecials,
    navShowFlipBooks: author.navShowFlipBooks,
    navShowBlog: author.navShowBlog,
    navShowContact: author.navShowContact,
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages & Navigation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control which menu items appear on your public site and create custom pages.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Page
        </Link>
      </div>

      {/* Navigation Menu Toggles */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-1">Navigation Menu</h2>
        <p className="text-sm text-gray-500 mb-4">
          Toggle built-in menu items on or off. Hidden items won&apos;t appear in your site navigation,
          but the pages still exist at their URLs.
        </p>
        <NavSettingsPanel
          initial={navSettings}
          flipBooksEnabled={((author.plan as any)?.flipBooksLimit ?? 0) !== 0}
        />
      </section>

      {/* Custom Pages */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-gray-900">Custom Pages</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Create pages for events, FAQs, newsletters, or anything else your readers need.
          Published pages with &quot;Show in nav&quot; enabled will appear in your site menu.
        </p>

        {pages.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No custom pages yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Add a page to give your readers more content — events, contact info, FAQs, and more.
            </p>
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first page
            </Link>
          </div>
        ) : (
          <PagesListClient pages={pages} />
        )}
      </section>
    </div>
  );
}
