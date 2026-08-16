import { Heart } from "lucide-react";

export function BookstoreHero() {
  return (
    <div className="bg-[#243756] py-3 sm:py-4 px-4 sm:px-6 mb-6 rounded-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 text-center sm:text-left flex-wrap sm:flex-nowrap">
        {/* Icon */}
        <div className="p-1.5 bg-[#16233d] border border-[rgba(243,236,219,0.15)] rounded-full shadow-sm flex-shrink-0">
          <Heart className="h-4 w-4 text-[#d6a94a]" />
        </div>

        <p className="text-sm text-[#93a0bc] leading-snug">
          <span className="font-serif italic text-base text-[#f3ecdb] font-normal">Support authors who care about readers.</span>{" "}
          Buy directly from independent voices — no middlemen, no algorithms.
        </p>
      </div>
    </div>
  );
}
