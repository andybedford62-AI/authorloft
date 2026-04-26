"use client";

import { useState } from "react";

interface RenewalReminderBannerProps {
  currentPeriodEnd: Date;
}

export function RenewalReminderBanner({ currentPeriodEnd }: RenewalReminderBannerProps) {
  const [loading, setLoading] = useState(false);

  const now      = new Date();
  const msLeft   = currentPeriodEnd.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (daysLeft > 30 || daysLeft <= 0) return null;

  const dateStr = currentPeriodEnd.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const urgency = daysLeft <= 7
    ? { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", icon: "⚠️" }
    : { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "🔔" };

  async function openPortal() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background:   urgency.bg,
        borderBottom: `1px solid ${urgency.border}`,
        color:        urgency.text,
      }}
      className="px-6 py-2.5 flex items-center justify-between gap-4 text-sm"
    >
      <span>
        {urgency.icon}{" "}
        <strong>Subscription renews {daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}</strong>
        {" "}— {dateStr}
      </span>
      <button
        onClick={openPortal}
        disabled={loading}
        className="text-xs font-semibold underline underline-offset-2 whitespace-nowrap disabled:opacity-50"
        style={{ color: urgency.text }}
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
    </div>
  );
}
