"use client";

import Link from "next/link";

interface TrialReminderBannerProps {
  trialEndsAt:  Date;
  planName:     string;
}

export function TrialReminderBanner({ trialEndsAt, planName }: TrialReminderBannerProps) {
  const now      = new Date();
  const msLeft   = trialEndsAt.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  // Don't show if trial is already expired (cron will clean it up)
  if (daysLeft <= 0) return null;

  const dateStr = trialEndsAt.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const urgency = daysLeft <= 7
    ? { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", btnBg: "#dc2626", btnText: "#fff", icon: "⚠️" }
    : { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", btnBg: "#2563eb", btnText: "#fff", icon: "🎁" };

  const dayLabel = daysLeft === 1 ? "1 day" : `${daysLeft} days`;

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
        <strong>{planName} trial — {dayLabel} remaining</strong>
        {" "}· Expires {dateStr}
      </span>
      <Link
        href="/admin/settings#billing"
        style={{ background: urgency.btnBg, color: urgency.btnText }}
        className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-md whitespace-nowrap transition-opacity hover:opacity-80"
      >
        Upgrade Now
      </Link>
    </div>
  );
}
