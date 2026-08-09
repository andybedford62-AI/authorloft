import { z } from "zod";

/**
 * Stripe subscription checkout request
 */
export const subscriptionCheckoutSchema = z.object({
  priceId: z
    .string()
    .min(1, "Price ID required")
    .regex(/^price_/, "Invalid price ID format"),
});

export type SubscriptionCheckoutRequest = z.infer<
  typeof subscriptionCheckoutSchema
>;

export function validateSubscriptionCheckout(data: unknown) {
  return subscriptionCheckoutSchema.safeParse(data);
}
