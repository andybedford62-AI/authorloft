import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCategories } from "@/lib/categories";
import { DownloadsClient } from "./downloads-client";

export default async function ResourceDownloadsPage() {
  const [downloads, categories, leads, leadCount] = await Promise.all([
    prisma.resourceDownload.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] }),
    getCategories("resource"),
    prisma.downloadLead.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.downloadLead.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resource Downloads</h1>
        <p className="text-sm text-gray-500 mt-1">
          Downloadable files (checklists, guides, templates) shown on the public{" "}
          <Link href="/resources" className="text-purple-600 hover:underline">/resources</Link> page.
          Readers enter their email once to unlock downloads.
          Manage the affiliate directory under{" "}
          <Link href="/super-admin/resources" className="text-purple-600 hover:underline">Resources</Link>{" "}
          and the categories under{" "}
          <Link href="/super-admin/categories" className="text-purple-600 hover:underline">Content Categories</Link>.
        </p>
      </div>
      <DownloadsClient
        initial={downloads}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />

      {/* Recent download leads */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Download leads</h2>
          <span className="text-sm text-gray-400">{leadCount} total · showing latest {leads.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Source</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{l.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{l.source ?? "—"}</td>
                  <td className="px-5 py-3 text-right text-gray-400">{new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <div className="py-10 text-center text-gray-400 text-sm">No download leads yet.</div>}
        </div>
      </div>
    </div>
  );
}
