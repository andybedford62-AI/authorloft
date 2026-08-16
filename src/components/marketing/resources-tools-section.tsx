"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Star, Search } from "lucide-react";
import { MarketingFilterToolbar } from "./marketing-filter-toolbar";

type Resource = {
  id: string;
  name: string;
  description: string | null;
  websiteUrl: string;
  category: string | null;
  isPartner: boolean;
  logoUrl: string | null;
  avatarColor: string | null;
  initials: string | null;
};

const CATEGORY_META: Record<string, { accent: string; label: string }> = {
  "Community & Advocacy":  { accent: "#d6a94a", label: "Community" },
  "Publishing Tools":      { accent: "#e2bc6e", label: "Tools" },
  "Education & Advice":    { accent: "#7BAFD4", label: "Education" },
  "Marketing & Discovery": { accent: "#A8C5A0", label: "Marketing" },
};
function catMeta(category: string) {
  return CATEGORY_META[category] ?? { accent: "#d6a94a", label: category };
}

const VAULT = {
  bg: "#16233d", surf2: "#243756", ink: "#f3ecdb", mute: "#93a0bc", gold: "#d6a94a",
};

export function ResourcesToolsSection({
  resources,
  categories,
}: {
  resources: Resource[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter((r) => [r.name, r.description, r.category].join(" ").toLowerCase().includes(q));
  }, [resources, query]);

  const visibleCategories = activeCategory ? [activeCategory] : categories;
  const resultCount = filtered.filter((r) => !activeCategory || r.category === activeCategory).length;

  return (
    <div>
      <MarketingFilterToolbar
        variant="dark"
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search tools & communities"
        resultCount={resultCount}
        totalCount={resources.length}
        itemLabel="listings"
      />

      {resultCount === 0 && resources.length > 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 mx-auto mb-4" style={{ color: `${VAULT.gold}66` }} />
          <p style={{ fontFamily: "Georgia, serif", color: "rgba(255,255,255,0.5)" }}>No listings match your filters.</p>
          <button
            type="button"
            onClick={() => { setActiveCategory(""); setQuery(""); }}
            className="mt-4 text-sm font-semibold"
            style={{ color: VAULT.gold }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Category groups */}
      {visibleCategories.map((category) => {
        const items = filtered.filter((r) => r.category === category);
        if (items.length === 0) return null;
        const cm = catMeta(category);
        return (
          <div key={category} style={{ marginBottom: 72 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: cm.accent, flexShrink: 0 }} />
              <h2 style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: cm.accent, margin: 0 }}>{category}</h2>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{items.length}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 16 }}>
              {items.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-card"
                  style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", background: VAULT.surf2, border: "1px solid rgba(243,236,219,0.12)", borderRadius: 18, padding: "24px", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s", position: "relative", overflow: "hidden", minHeight: 160 }}
                >
                  {resource.isPartner && (
                    <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 5, background: `${VAULT.gold}20`, border: `1px solid ${VAULT.gold}50`, borderRadius: 999, padding: "4px 10px" }}>
                      <Star style={{ width: 10, height: 10, color: VAULT.gold, fill: VAULT.gold }} />
                      <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: VAULT.gold, fontWeight: 700 }}>Partner</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 18 }}>
                    <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 16, background: resource.logoUrl ? "#fff" : (resource.avatarColor ?? VAULT.surf2), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid rgba(243,236,219,0.12)" }}>
                      {resource.logoUrl ? (
                        <Image src={resource.logoUrl} alt={resource.name} width={80} height={80} style={{ objectFit: "contain", padding: 8 }} />
                      ) : (
                        <span style={{ fontFamily: "var(--font-heading, serif)", fontSize: (resource.initials?.length ?? 0) > 2 ? 16 : 22, fontWeight: 600, color: VAULT.ink }}>
                          {resource.initials || resource.name[0]}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontFamily: "var(--font-heading, serif)", fontStyle: "italic", fontSize: 18, fontWeight: 400, color: VAULT.ink, margin: 0, lineHeight: 1.3 }}>{resource.name}</p>
                        <ArrowUpRight style={{ width: 15, height: 15, color: VAULT.gold, flexShrink: 0 }} />
                      </div>
                    </div>
                  </div>

                  <p style={{ fontFamily: "Georgia, serif", fontSize: 13.5, lineHeight: 1.65, color: VAULT.mute, margin: "0 0 20px", flex: 1 }}>
                    {resource.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: cm.accent, background: `${cm.accent}15`, border: `1px solid ${cm.accent}35`, borderRadius: 999, padding: "3px 10px" }}>{cm.label}</span>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, letterSpacing: "0.08em", color: VAULT.gold }}>Visit →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {resources.length === 0 && (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontFamily: "Georgia, serif", padding: "60px 0" }}>Resources coming soon.</p>
      )}
    </div>
  );
}
