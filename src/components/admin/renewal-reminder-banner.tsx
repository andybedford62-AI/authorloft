import Link from "next/link";

interface RenewalReminderBannerProps {
  currentPeriodEnd: Date;
}

export function RenewalReminderBanner({ currentPeriodEnd }: RenewalReminderBannerProps) {
  const now        = new Date();
  const msLeft     = currentPeriodEnd.getTime() - now.getTime();
  const daysLeft   = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (daysLeft > 30 || daysLeft <= 0) return null;

  const dateStr = currentPeriodEnd.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const urgency = daysLeft <= 7
    ? { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", icon: "⚠️" }
    : { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "🔔" };

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
      <Link
        href="/admin/settings"
        className="text-xs font-semibold underline underline-offset-2 whitespace-nowrap"
        style={{ color: urgency.text }}
      >
        Manage billing
      </Link>
    </div>
  );
}
