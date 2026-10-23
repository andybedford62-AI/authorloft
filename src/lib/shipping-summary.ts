import { countryName } from "@/lib/shipping-countries";
import { formatCents } from "@/lib/utils";

type SummaryZone = {
  name: string;
  countries: string[];
  isRestOfWorld: boolean;
  firstItemCents: number;
  additionalItemCents: number;
  estimateNote: string | null;
};
type SummaryProfile = { name: string; freeOverCents: number | null; zones: SummaryZone[] };

/** The zone that prices a buyer in `country` (a named zone first, else the catch-all), or null. */
export function zoneFor(profile: SummaryProfile, country: string): SummaryZone | null {
  return profile.zones.find((z) => z.countries.includes(country)) ?? profile.zones.find((z) => z.isRestOfWorld) ?? null;
}

/** Plain-language lines describing a profile's prices, shown next to the profile picker. */
export function summarizeProfile(profile: SummaryProfile, shipFrom: string | null): { lines: string[]; warning: string | null } {
  const lines = profile.zones.map((z) => {
    const where =
      z.isRestOfWorld && z.countries.length === 0
        ? "All other countries"
        : z.countries.map(countryName).join(", ") + (z.isRestOfWorld ? " + all other countries" : "");
    const extra = z.additionalItemCents > 0 ? `, ${formatCents(z.additionalItemCents)} each additional copy` : "";
    return `${where}: ${formatCents(z.firstItemCents)} first copy${extra}${z.estimateNote ? ` (${z.estimateNote})` : ""}`;
  });
  if (!profile.zones.some((z) => z.isRestOfWorld)) lines.push("Not shipped to any other country.");
  if (profile.freeOverCents) lines.push(`Free shipping over ${formatCents(profile.freeOverCents)}.`);

  let warning: string | null = null;
  if (!shipFrom) warning = "Choose the country you ship from (in Settings → Shipping) to see what your own buyers pay.";
  else if (!zoneFor(profile, shipFrom)) warning = `This profile has no price for ${countryName(shipFrom)}, so buyers there can't order.`;
  return { lines, warning };
}

/** What a buyer in the author's own country pays for one copy at `priceCents`, e.g. "$14.99 + $5.00 shipping = $19.99". */
export function buyerTotalText(profile: SummaryProfile, shipFrom: string | null, priceCents: number): string | null {
  if (!shipFrom) return null;
  const zone = zoneFor(profile, shipFrom);
  if (!zone) return null;
  const free = profile.freeOverCents != null && profile.freeOverCents > 0 && priceCents >= profile.freeOverCents;
  const ship = free ? 0 : zone.firstItemCents;
  return ship === 0
    ? `${formatCents(priceCents)} with free shipping`
    : `${formatCents(priceCents)} + ${formatCents(ship)} shipping = ${formatCents(priceCents + ship)}`;
}
