// CSS-only browser window mockup — no images required.
// Renders a stylised author site preview used in the marketing hero.

const BOOK_COLORS = [
  ["#7c3aed", "#c026d3"],
  ["#0891b2", "#0d9488"],
  ["#dc2626", "#db2777"],
];

export function BrowserMockup() {
  return (
    <div className="relative w-full max-w-[480px] rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10 select-none">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1e1e2e] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-3 bg-white/8 rounded-md px-3 py-1 text-[11px] text-gray-400 text-center truncate border border-white/5">
          yourname.authorloft.com
        </div>
      </div>

      {/* Page body */}
      <div className="bg-[#1a2236]">

        {/* Nav bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <div className="w-20 h-2 bg-amber-400/60 rounded-full" />
          <div className="hidden sm:flex gap-4">
            {["Books", "About", "Contact"].map((s) => (
              <div key={s} className="w-10 h-1.5 bg-white/15 rounded-full" />
            ))}
          </div>
        </div>

        {/* Hero strip */}
        <div className="px-6 py-7 space-y-3">
          <div className="w-14 h-1.5 bg-amber-400/50 rounded-full" />
          <div className="w-52 h-5 bg-white/85 rounded-md" />
          <div className="w-64 h-2.5 bg-white/35 rounded-full" />
          <div className="w-48 h-2.5 bg-white/25 rounded-full" />
          <div className="flex gap-2 pt-2">
            <div className="w-24 h-8 rounded-lg bg-amber-400/85" />
            <div className="w-24 h-8 rounded-lg border border-white/25" />
          </div>
        </div>

        {/* Book covers row */}
        <div className="px-6 pb-4 flex gap-3 items-end">
          {BOOK_COLORS.map(([a, b], i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-lg shadow-xl"
              style={{
                width:      i === 0 ? 72 : i === 1 ? 58 : 48,
                height:     i === 0 ? 108 : i === 1 ? 88 : 72,
                background: `linear-gradient(135deg, ${a}, ${b})`,
                opacity:    i === 2 ? 0.7 : 1,
              }}
            />
          ))}
          <div className="flex-1 space-y-2 pl-2 pb-1">
            <div className="w-full h-2 bg-white/20 rounded-full" />
            <div className="w-3/4 h-2 bg-white/12 rounded-full" />
            <div className="w-1/2 h-2 bg-white/8 rounded-full" />
          </div>
        </div>

        {/* Section divider */}
        <div className="border-t border-white/5 px-6 py-4 bg-[#151d30]">
          <div className="flex gap-4">
            {[70, 55, 65].map((w, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-10 w-10 rounded-lg bg-white/8" />
                <div className={`h-1.5 bg-white/20 rounded-full`} style={{ width: w }} />
                <div className="h-1.5 w-16 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
