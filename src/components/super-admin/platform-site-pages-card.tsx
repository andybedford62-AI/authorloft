import { ExternalLink, Globe } from "lucide-react";
import { PLATFORM_STATIC_PAGES } from "@/lib/site-pages";
import { LANDING_PAGES } from "@/lib/landing-page-data";
import { COMPARISONS } from "@/lib/comparison-data";
import { SitemapUrlPill } from "@/components/admin/sitemap-url-pill";

interface Props {
  baseUrl: string;
  /** Published-item counts shown next to the section index pages. */
  counts: { "/blog": number; "/news": number; "/guides": number };
}

const pill =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-colors";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PagePill({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={pill}>
      {label}
      {count !== undefined && <span className="text-xs text-gray-500">· {count}</span>}
      <ExternalLink className="h-3 w-3 text-gray-400" />
    </a>
  );
}

export function PlatformSitePagesCard({ baseUrl, counts }: Props) {
  const groups = ["Main", "Content", "Company & legal"] as const;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-400" />
          Platform Site Pages
        </h2>
        <a
          href={baseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          Visit site <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="p-5 space-y-5">
        {groups.map((group) => (
          <Group key={group} title={group}>
            {PLATFORM_STATIC_PAGES.filter((p) => p.group === group).map((p) => (
              <PagePill
                key={p.path}
                href={`${baseUrl}${p.path === "/" ? "" : p.path}`}
                label={p.label}
                count={(counts as Record<string, number>)[p.path]}
              />
            ))}
          </Group>
        ))}

        <Group title="Solutions">
          {Object.values(LANDING_PAGES).map((p) => (
            <PagePill key={p.slug} href={`${baseUrl}/${p.slug}`} label={p.eyebrow} />
          ))}
        </Group>

        <Group title="Compare">
          {Object.values(COMPARISONS).map((c) => (
            <PagePill key={c.slug} href={`${baseUrl}/compare/${c.slug}`} label={`vs ${c.name}`} />
          ))}
        </Group>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Submit this sitemap in Google Search Console and Bing Webmaster Tools.
        </p>
        <SitemapUrlPill url={`${baseUrl}/sitemap.xml`} />
      </div>
    </div>
  );
}
