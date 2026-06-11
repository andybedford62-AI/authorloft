"use client";

import { useState } from "react";

export type FaqGroup = {
  slug: string;
  name: string;
  items: { id: string; question: string; answer: string }[];
};

export function FaqPageList({ groups }: { groups: FaqGroup[] }) {
  // Open the first question of the first group by default.
  const [openId, setOpenId] = useState<string | null>(groups[0]?.items[0]?.id ?? null);

  if (groups.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#5C6E89", fontFamily: "Georgia, serif", padding: "60px 0" }}>
        FAQs coming soon.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
      {groups.map((group) => (
        <div key={group.slug} id={group.slug}>
          {/* Category heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
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
      ))}
    </div>
  );
}
