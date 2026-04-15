/**
 * PageBanner — standard top-of-page header used across all author site pages.
 *
 * Background: always var(--navy) — dark, consistent with nav and footer.
 * Label:      var(--accent) coloured small uppercase text.
 * Title:      large white serif heading.
 * Subtitle:   optional muted white sub-line.
 */

export function PageBanner({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section
      className="w-full py-14 px-4 text-center"
      style={{ backgroundColor: "var(--navy, #1a2236)" }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--accent, #c9a84c)" }}
      >
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
