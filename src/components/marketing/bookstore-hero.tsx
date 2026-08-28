import { Heart } from "lucide-react";

export function BookstoreHero() {
  return (
    <div className="bg-vault-surf-2 py-3 sm:py-4 px-4 sm:px-6 mb-6 rounded-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 text-center sm:text-left flex-wrap sm:flex-nowrap">
        {/* Icon */}
        <div className="p-1.5 bg-vault-bg border border-vault-ink/15 rounded-full shadow-sm flex-shrink-0">
          <Heart className="h-4 w-4 text-vault-gold" />
        </div>

        <p className="text-sm text-vault-mute leading-snug">
          <span className="font-vault-display italic text-base text-vault-ink font-normal">Support authors who care about readers.</span>{" "}
          Buy directly from independent voices — no middlemen, no algorithms.
        </p>
      </div>
    </div>
  );
}
