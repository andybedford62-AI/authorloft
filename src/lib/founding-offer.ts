import { prisma } from "@/lib/db";

export type FoundingOfferCopy = {
  headline: string;
  subtext: string;
  percentOff: number;
};

// Whichever founding-member offer is currently live — Super Admin → Coupons.
// Public marketing pages show static copy (no per-visitor countdown, unlike
// the logged-in dashboard banner which knows the viewer's signup date).
export async function getFoundingOfferCopy(): Promise<FoundingOfferCopy | null> {
  const offer = await prisma.earlyBirdOffer.findFirst({
    where:  { enabled: true },
    select: { headline: true, subtext: true, percentOff: true, durationMonths: true, windowDays: true },
  });
  if (!offer) return null;

  const headline = offer.headline?.trim()
    || `Founding member offer: ${offer.percentOff}% off your first ${offer.durationMonths} month${offer.durationMonths === 1 ? "" : "s"}`;
  const subtext = offer.subtext?.trim()
    || `Sign up free, then upgrade within your first ${offer.windowDays} day${offer.windowDays === 1 ? "" : "s"} to lock it in. It applies automatically at checkout.`;

  return { headline, subtext, percentOff: offer.percentOff };
}
