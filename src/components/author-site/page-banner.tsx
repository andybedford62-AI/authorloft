/**
 * PageBanner — standard top-of-page header used across all author site pages.
 *
 * Background: accentColor from the author's selected theme (matches hero).
 *             Falls back to var(--navy) if no accentColor is provided.
 * Label:      small uppercase text at reduced opacity.
 * Title:      large white serif heading.
 * Subtitle:   optional muted white sub-line.
 */

export function PageBanner({
  label,
  title,
  subtitle,
  accentColor,
}: {
  label: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
}) {
  return (
    <section
      className="w-full py-14 px-4 text-center"
      style={{ backgroundColor: accentColor ?? "var(--navy, #1a2236)" }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60">
        {label}
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold text-white font-heading leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-white/65 text-base max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </section>
  );
}
