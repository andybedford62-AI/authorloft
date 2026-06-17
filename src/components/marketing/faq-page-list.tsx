"use client";

import { useState } from "react";
import {
  HelpCircle, CreditCard, BookOpen, Rocket, User, Settings,
  Mail, Globe, ShoppingBag, Megaphone, BookMarked, Feather,
  type LucideIcon,
} from "lucide-react";

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
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#5C6E89", fontFamily: "Georgia, serif", padding: "60px 0" }}>
        FAQs coming soon.
      </p>
    );
  }

  const visibleGroups = activeSlug ? groups.filter((g) => g.slug === activeSlug) : groups;

  return (
    <div>
      {/* Category filter tabs — underline style matching the blog */}
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-x-7 gap-y-1 border-b border-[#DCDBD3] mb-10">
          {[{ slug: null, name: "All" }, ...groups.map((g) => ({ slug: g.slug, name: g.name }))].map(({ slug, name }) => {
            const active = slug === activeSlug;
            return (
              <button
                key={slug ?? "__all__"}
                type="button"
                onClick={() => {
                  setActiveSlug(slug);
                  setOpenId(null);
                }}
                className={`relative pb-3.5 text-sm font-semibold transition-colors ${
                  active ? "text-[#1B2B47]" : "text-[#5C6E89] hover:text-[#1B2B47]"
                }`}
              >
                {name}
                <span
                  className={`absolute left-0 right-0 -bottom-px h-0.5 bg-[#D4AE6A] origin-left transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {visibleGroups.map((group) => {
          const Icon = getCategoryIcon(group.slug);
          return (
            <div
              key={group.slug}
              id={group.slug}
              style={{
                background: "#fff",
                border: "1px solid #DCDBD3",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(27,43,71,0.06)",
                padding: "28px 28px",
              }}
            >
              {/* Category heading with icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Icon style={{ width: 15, height: 15, color: "#C26A4A", flexShrink: 0 }} />
                <h2 style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C26A4A", margin: 0 }}>
                  {group.name}
                </h2>
                <div style={{ flex: 1, height: 1, background: "#DCDBD3" }} />
                <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "#9b8e7e" }}>{group.items.length}</span>
              </div>

              {/* Accordion */}
              <div style={{ borderTop: "2px solid #1B2B47" }}>
                {group.items.map((item) => {
                  const open = openId === item.id;
                  return (
                    <div key={item.id} style={{ borderBottom: "1px solid #DCDBD3" }}>
                      <button
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={open}
                        style={{
                          width: "100%", display: "flex", alignItems: "flex-start", gap: 16,
                          padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ flex: 1, fontFamily: "var(--font-heading, serif)", fontSize: 19, fontWeight: 400, color: "#1B2B47", lineHeight: 1.3 }}>
                          {item.question}
                        </span>
                        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 20, color: "#B8893D", flexShrink: 0, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>
                          +
                        </span>
                      </button>
                      {open && (
                        <div
                          className="rich-content"
                          style={{ padding: "0 0 22px", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.7, color: "#5C6E89" }}
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
    </div>
  );
}
