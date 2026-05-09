import { z } from "zod";

/**
 * Discount code validation request
 */
export const validateDiscountCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Code required")
    .max(50, "Code too long")
    .regex(/^[A-Z0-9-]+$/, "Invalid code format"),
  saleItemIds: z
    .array(z.string().min(1, "Invalid item ID"))
    .nonempty("At least one item required"),
});

export type ValidateDiscountCodeRequest = z.infer<
  typeof validateDiscountCodeSchema
>;

export function validateDiscountCodeRequest(data: unknown) {
  return validateDiscountCodeSchema.safeParse(data);
}
