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

      <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Submit this sitemap to{" "}
          <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
            Google Search Console
          </a>
          {" "}or{" "}
          <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
            Bing Webmaster Tools
          </a>
          {" "}to help search engines find your pages:
        </p>
        <a
          href={`${baseUrl}/sitemap.xml`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-600 hover:text-blue-700 bg-white border border-gray-200 rounded-full px-3 py-1.5"
        >
          {baseUrl}/sitemap.xml
          <ExternalLink className="h-3 w-3 text-gray-400" />
        </a>
      </div>
    </div>
  );
}
