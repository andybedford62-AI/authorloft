"use client";

import { useMemo, useState } from "react";
import {
  HelpCircle, CreditCard, BookOpen, Rocket, User, Settings,
  Mail, Globe, ShoppingBag, Megaphone, BookMarked, Feather, Search,
  type LucideIcon,
} from "lucide-react";
import { MarketingFilterToolbar } from "./marketing-filter-toolbar";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "getting-started":  Rocket,
  "plans":            CreditCard,
  "billing":          CreditCard,
  "pricing":          CreditCard,
  "publishing":       BookOpen,
  "selling":          ShoppingBag,
  "direct-sales":     ShoppingBag,
  "sales":            ShoppingBag,
  "account":          User,
  "technical":        Settings,
  "newsletter":       Mail,
  "domain":           Globe,
  "marketing":        Megaphone,
  "general":          HelpCircle,
  "books":            BookMarked,
  "writing":          Feather,
};

function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug.toLowerCase()] ?? HelpCircle;
}

export type FaqGroup = {
  slug: string;
  name: string;
  items: { id: string; question: string; answer: string }[];
};

export function FaqPageList({ groups }: { groups: FaqGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(groups[0]?.items[0]?.id ?? null);
  const [activeName, setActiveName] = useState("");
  const [query, setQuery] = useState("");

  const totalCount = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);
  const categoryNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => !activeName || g.name === activeName)
      .map((g) => ({
        ...g,
        items: q
          ? g.items.filter((i) => (i.question + " " + i.answer).toLowerCase().includes(q))
          : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, activeName, query]);

  const resultCount = useMemo(() => visibleGroups.reduce((n, g) => n + g.items.length, 0), [visibleGroups]);

  if (groups.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#93a0bc", fontFamily: "Georgia, serif", padding: "60px 0" }}>
        FAQs coming soon.
      </p>
    );
  }

  return (
    <div>
      <MarketingFilterToolbar
        variant="dark"
        categories={categoryNames}
        activeCategory={activeName}
        onCategoryChange={(c) => { setActiveName(c); setOpenId(null); }}
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search FAQs"
        resultCount={resultCount}
        totalCount={totalCount}
        itemLabel="questions"
      />

      {visibleGroups.length === 0 ? (
        <div className="text-center py-18">
          <Search className="h-10 w-10 text-[#d6a94a]/40 mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-[#f3ecdb] mb-2">No questions found</h3>
          <p className="text-sm text-[#93a0bc] mb-4">Try a different category or clear your search.</p>
          <button
            type="button"
            onClick={() => { setActiveName(""); setQuery(""); }}
            className="border border-[#d6a94a] text-[#d6a94a] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#d6a94a]/10 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {visibleGroups.map((group) => {
          const Icon = getCategoryIcon(group.slug);
          return (
            <div
              key={group.slug}
              id={group.slug}
              style={{
                background: "#1e2f4d",
                border: "1px solid rgba(243,236,219,0.12)",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                padding: "28px 28px",
              }}
            >
              {/* Category heading with icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Icon style={{ width: 15, height: 15, color: "#d6a94a", flexShrink: 0 }} />
                <h2 style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#d6a94a", margin: 0 }}>
                  {group.name}
                </h2>
                <div style={{ flex: 1, height: 1, background: "rgba(243,236,219,0.12)" }} />
                <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "#93a0bc" }}>{group.items.length}</span>
              </div>

              {/* Accordion */}
              <div style={{ borderTop: "2px solid #d6a94a" }}>
                {group.items.map((item) => {
                  const open = openId === item.id;
                  return (
                    <div key={item.id} style={{ borderBottom: "1px solid rgba(243,236,219,0.12)" }}>
                      <button
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={open}
                        style={{
                          width: "100%", display: "flex", alignItems: "flex-start", gap: 16,
                          padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ flex: 1, fontFamily: "var(--font-heading, serif)", fontSize: 19, fontWeight: 400, color: "#f3ecdb", lineHeight: 1.3 }}>
                          {item.question}
                        </span>
                        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 20, color: "#d6a94a", flexShrink: 0, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>
                          +
                        </span>
                      </button>
                      {open && (
                        <div
                          className="rich-content"
                          style={{ padding: "0 0 22px", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.7, color: "#93a0bc" }}
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
