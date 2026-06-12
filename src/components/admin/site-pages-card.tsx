import { ExternalLink, Globe } from "lucide-react";
import { getAuthorSitePages, type AuthorNavFlags, type AuthorCustomPage } from "@/lib/site-pages";

interface Props {
  baseUrl: string;
  author: AuthorNavFlags;
  customPages?: AuthorCustomPage[];
}

export function SitePagesCard({ baseUrl, author, customPages }: Props) {
  const pages = getAuthorSitePages(author, customPages);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-400" />
          Your Site Pages
        </h2>
        <a
          href={baseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Visit site <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="flex flex-wrap gap-2 p-4">
        {pages.map((page) => (
          <a
            key={page.path}
            href={`${baseUrl}${page.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          >
            {page.label}
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        ))}
      </div>
    </div>
  );
}
