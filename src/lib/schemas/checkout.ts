import { z } from "zod";

/**
 * Checkout request validation
 */
export const checkoutRequestSchema = z
  .object({
    items: z
      .array(
        z.object({
          saleItemId: z.string().min(1, "Sale item ID required"),
        })
      )
      .nonempty("At least one item required")
      .optional(),
    saleItemId: z.string().min(1, "Sale item ID required").optional(),
    bundleId: z.string().min(1, "Bundle ID required").optional(),
    courseId: z.string().min(1, "Course ID required").optional(),
    discountCode: z
      .string()
      .max(50, "Discount code too long")
      .regex(/^[A-Z0-9-]+$/, "Invalid discount code format")
      .optional(),
  })
  .refine(
    (data) => data.items || data.saleItemId || data.bundleId || data.courseId,
    "Either items array, saleItemId, bundleId, or courseId must be provided"
  );

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/**
 * Validate checkout request
 */
export function validateCheckoutRequest(data: unknown) {
  return checkoutRequestSchema.safeParse(data);
}
