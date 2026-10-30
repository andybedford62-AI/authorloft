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
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-700 text-sm text-gray-300 hover:border-purple-500 hover:text-purple-300 hover:bg-gray-800 transition-colors";

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
      <ExternalLink className="h-3 w-3 text-gray-500" />
    </a>
  );
}

export function PlatformSitePagesCard({ baseUrl, counts }: Props) {
  const groups = ["Main", "Content", "Company & legal"] as const;

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden mb-10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          Platform Site Pages
        </h2>
        <a
          href={baseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          Visit site <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="p-6 space-y-5">
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

      <div className="flex items-center justify-between gap-3 flex-wrap px-6 py-3 border-t border-gray-800 bg-gray-950/50">
        <p className="text-xs text-gray-500">
          Submit this sitemap in Google Search Console and Bing Webmaster Tools.
        </p>
        <SitemapUrlPill url={`${baseUrl}/sitemap.xml`} dark />
      </div>
    </div>
  );
}
