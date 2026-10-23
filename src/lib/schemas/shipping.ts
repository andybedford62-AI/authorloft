import { z } from "zod";
import { isShippableCountry } from "@/lib/shipping-countries";

const MAX_RATE_CENTS = 100_000; // $1,000: a sanity cap on a single postage rate

export const shippingZoneSchema = z.object({
  name: z.string().trim().min(1, "Zone name required").max(60),
  countries: z.array(z.string().length(2)).max(250).default([]),
  isRestOfWorld: z.boolean().default(false),
  firstItemCents: z.number().int().min(0).max(MAX_RATE_CENTS),
  additionalItemCents: z.number().int().min(0).max(MAX_RATE_CENTS).default(0),
  estimateNote: z.string().trim().max(80).nullish().transform((v) => v || null),
});

export const shippingProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Profile name required").max(60),
    freeOverCents: z.number().int().min(1).max(1_000_000).nullish().transform((v) => v ?? null),
    zones: z.array(shippingZoneSchema).min(1, "Add at least one zone").max(30),
  })
  .superRefine((profile, ctx) => {
    const seen = new Set<string>();
    let restOfWorld = 0;
    profile.zones.forEach((zone, i) => {
      if (zone.isRestOfWorld) restOfWorld++;
      if (zone.countries.length === 0 && !zone.isRestOfWorld) {
        ctx.addIssue({ code: "custom", path: ["zones", i], message: `Zone "${zone.name}" needs at least one country or "Rest of world".` });
      }
      for (const code of zone.countries) {
        if (!isShippableCountry(code)) {
          ctx.addIssue({ code: "custom", path: ["zones", i, "countries"], message: `${code} isn't a supported destination.` });
        } else if (seen.has(code)) {
          ctx.addIssue({ code: "custom", path: ["zones", i, "countries"], message: `${code} appears in more than one zone.` });
        }
        seen.add(code);
      }
    });
    if (restOfWorld > 1) ctx.addIssue({ code: "custom", path: ["zones"], message: 'Only one zone can be "Rest of world".' });
  });

export type ShippingProfileInput = z.infer<typeof shippingProfileSchema>;
