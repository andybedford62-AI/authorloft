"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";

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
  "Community & Advocacy":  { accent: "#D4AE6A", label: "Community" },
  "Publishing Tools":      { accent: "#C26A4A", label: "Tools" },
  "Education & Advice":    { accent: "#7BAFD4", label: "Education" },
  "Marketing & Discovery": { accent: "#A8C5A0", label: "Marketing" },
};
function catMeta(category: string) {
  return CATEGORY_META[category] ?? { accent: "#D4AE6A", label: category };
}

const ML = {
  midnight: "#0F1A2D", ink: "#1B2B47", bone: "#E8E5DD",
  pearl: "#F0EDE4", brass: "#B8893D", brass2: "#D4AE6A",
  copper: "#C26A4A", slate: "#5C6E89",
};

export function ResourcesToolsSection({
  resources,
  categories,
}: {
  resources: Resource[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visibleCategories = activeCategory ? [activeCategory] : categories;

  return (
    <div>
      {/* Underline tab filter — dark-adapted */}
      {categories.length > 1 && (
        <div
          className="flex flex-wrap gap-x-7 gap-y-1 mb-10"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
        >
          {[{ key: null, label: "All" }, ...categories.map((c) => ({ key: c, label: c }))].map(({ key, label }) => {
            const active = key === activeCategory;
            return (
              <button
                key={key ?? "__all__"}
                type="button"
                onClick={() => setActiveCategory(key)}
                className="relative pb-3.5 text-sm font-semibold transition-colors"
                style={{ color: active ? ML.bone : "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", padding: "0 0 14px" }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                {label}
                <span
                  className={`absolute left-0 right-0 -bottom-px h-0.5 origin-left transition-transform duration-200 ${active ? "scale-x-100" : "scale-x-0"}`}
                  style={{ background: ML.brass2 }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Category groups */}
      {visibleCategories.map((category) => {
        const items = resources.filter((r) => r.category === category);
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
                  style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", background: ML.pearl, border: "1px solid #DCDBD3", borderRadius: 18, padding: "24px", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s", position: "relative", overflow: "hidden", minHeight: 160 }}
                >
                  {resource.isPartner && (
                    <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 5, background: `${ML.brass}20`, border: `1px solid ${ML.brass}50`, borderRadius: 999, padding: "4px 10px" }}>
                      <Star style={{ width: 10, height: 10, color: ML.brass, fill: ML.brass }} />
                      <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: ML.brass, fontWeight: 700 }}>Partner</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 18 }}>
                    <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 16, background: resource.logoUrl ? "#fff" : (resource.avatarColor ?? ML.ink), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid #DCDBD3" }}>
                      {resource.logoUrl ? (
                        <Image src={resource.logoUrl} alt={resource.name} width={80} height={80} style={{ objectFit: "contain", padding: 8 }} />
                      ) : (
                        <span style={{ fontFamily: "var(--font-heading, serif)", fontSize: (resource.initials?.length ?? 0) > 2 ? 16 : 22, fontWeight: 600, color: ML.bone }}>
                          {resource.initials || resource.name[0]}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontFamily: "var(--font-heading, serif)", fontSize: 18, fontWeight: 400, color: ML.ink, margin: 0, lineHeight: 1.3 }}>{resource.name}</p>
                        <ArrowUpRight style={{ width: 15, height: 15, color: ML.copper, flexShrink: 0 }} />
                      </div>
                    </div>
                  </div>

                  <p style={{ fontFamily: "Georgia, serif", fontSize: 13.5, lineHeight: 1.65, color: ML.slate, margin: "0 0 20px", flex: 1 }}>
                    {resource.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: cm.accent, background: `${cm.accent}15`, border: `1px solid ${cm.accent}35`, borderRadius: 999, padding: "3px 10px" }}>{cm.label}</span>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, letterSpacing: "0.08em", color: ML.brass }}>Visit →</span>
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
