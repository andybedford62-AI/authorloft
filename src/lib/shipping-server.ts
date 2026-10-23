import type { Prisma } from "@prisma/client";
import type { ShippingCartItem } from "@/lib/shipping";

/** Prisma `include` that loads a sale item's shipping profile with its zones in display order. */
export const withShippingProfile = {
  shippingProfile: { include: { zones: { orderBy: { sortOrder: "asc" } } } },
} satisfies Prisma.BookDirectSaleItemInclude;

type SaleItemWithProfile = Prisma.BookDirectSaleItemGetPayload<{ include: typeof withShippingProfile }>;

/** Shape a loaded PRINT sale item for the pure rate maths in `@/lib/shipping`. */
export function toShippingCartItem(item: Pick<SaleItemWithProfile, "id" | "priceCents" | "shippingProfile">): ShippingCartItem {
  const p = item.shippingProfile;
  return {
    saleItemId: item.id,
    priceCents: item.priceCents,
    profile: p && {
      id: p.id,
      name: p.name,
      freeOverCents: p.freeOverCents,
      zones: p.zones.map((z) => ({
        id: z.id,
        name: z.name,
        countries: z.countries,
        isRestOfWorld: z.isRestOfWorld,
        firstItemCents: z.firstItemCents,
        additionalItemCents: z.additionalItemCents,
        estimateNote: z.estimateNote,
      })),
    },
  };
}

/** Customer-facing explanation for a failed quote. */
export function shippingFailureMessage(reason: "NO_PROFILE" | "NOT_SHIPPED", countryLabel: string): string {
  return reason === "NO_PROFILE"
    ? "Shipping isn't set up for a print edition in your cart yet. Please check back soon."
    : `The author doesn't ship one of these print editions to ${countryLabel}.`;
}
