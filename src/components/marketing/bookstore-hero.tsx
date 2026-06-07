import { Heart } from "lucide-react";

export function BookstoreHero() {
  return (
    <div className="bg-[#C5D3E6] py-6 sm:py-8 px-4 sm:px-6 mb-8 rounded-xl">
      <div className="max-w-5xl mx-auto text-center space-y-2 sm:space-y-3">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-2 bg-white border border-[#A9BDD6] rounded-full shadow-sm">
            <Heart className="h-5 w-5 text-[#27406B]" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-2xl sm:text-3xl text-[#1B2B47] font-normal">
          Support authors who care about readers
        </h2>

        {/* Subheading */}
        <p className="text-sm sm:text-base text-[#5C6E89] max-w-2xl mx-auto leading-relaxed">
          Buy directly from independent voices. No middlemen, no algorithms—just stories from writers
          who are genuinely grateful for every reader.
        </p>
      </div>
    </div>
  );
}
