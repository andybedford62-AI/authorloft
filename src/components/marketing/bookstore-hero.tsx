import { Heart } from "lucide-react";

export function BookstoreHero() {
  return (
    <div className="bg-[#C5D3E6] py-3 sm:py-4 px-4 sm:px-6 mb-6 rounded-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 text-center sm:text-left flex-wrap sm:flex-nowrap">
        {/* Icon */}
        <div className="p-1.5 bg-white border border-[#A9BDD6] rounded-full shadow-sm flex-shrink-0">
          <Heart className="h-4 w-4 text-[#27406B]" />
        </div>

        <p className="text-sm text-[#3a4a63] leading-snug">
          <span className="font-serif text-base text-[#1B2B47] font-normal">Support authors who care about readers.</span>{" "}
          Buy directly from independent voices — no middlemen, no algorithms.
        </p>
      </div>
    </div>
  );
}
