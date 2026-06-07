import { Heart } from "lucide-react";

export function BookstoreHero() {
  return (
    <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-transparent py-12 sm:py-16 md:py-20 px-4 sm:px-6 mb-12">
      <div className="max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-3 bg-white border border-amber-200 rounded-full shadow-sm">
            <Heart className="h-6 w-6 text-[#C26A4A]" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B2B47] font-normal leading-tight">
          Support authors who care about readers
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-[#5C6E89] max-w-2xl mx-auto leading-relaxed">
          Buy directly from independent voices. No middlemen, no algorithms—just stories from writers
          who are genuinely grateful for every reader.
        </p>

        {/* Accent line */}
        <div className="flex items-center justify-center gap-2 pt-4 sm:pt-6">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#B8893D]" />
          <span className="text-xs uppercase tracking-widest font-semibold text-[#C26A4A]">
            Direct to author
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#B8893D]" />
        </div>
      </div>
    </div>
  );
}
