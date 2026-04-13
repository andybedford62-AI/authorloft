import { Tablet, BookOpen, BookMarked, Headphones } from "lucide-react";

const FORMAT_CONFIG = {
  EBOOK:     { label: "eBook",     Icon: Tablet,     color: "#2563EB", bg: "#eff6ff" },
  PAPERBACK: { label: "Paperback", Icon: BookOpen,   color: "#059669", bg: "#ecfdf5" },
  HARDBACK:  { label: "Hardback",  Icon: BookMarked, color: "#7c3aed", bg: "#f5f3ff" },
  AUDIOBOOK: { label: "Audiobook", Icon: Headphones, color: "#d97706", bg: "#fffbeb" },
} as const;

type FormatKey = keyof typeof FORMAT_CONFIG;

interface FormatBadgesProps {
  formats: string[];
  size?: "sm" | "md";
}

export function FormatBadges({ formats, size = "md" }: FormatBadgesProps) {
  const active = formats.filter((f): f is FormatKey => f in FORMAT_CONFIG);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {active.map((key) => {
        const { label, Icon, color, bg } = FORMAT_CONFIG[key];
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${
              size === "sm"
                ? "text-[11px] px-2 py-0.5"
                : "text-xs px-2.5 py-1"
            }`}
            style={{
              backgroundColor: bg,
              color,
              borderColor: `${color}30`,
            }}
          >
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            {label}
          </span>
        );
      })}
    </div>
  );
}
