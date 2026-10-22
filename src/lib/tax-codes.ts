// Stripe Tax product tax codes for what authors sell. Every code here was checked against
// Stripe's Tax Codes API (GET /v1/tax_codes/:id) on Oct 22 2026. Don't guess or edit a code
// from memory: look it up at https://docs.stripe.com/tax/tax-codes first.
//
// These only change the tax calculated when the author has Stripe Tax switched on in their own
// Stripe account (see getConnectCheckoutConfig); otherwise Checkout collects no tax at all.

export const TAX_CODES = {
  /** "Digital Books - downloaded - non subscription - with permanent rights" */
  EBOOK: "txcd_10302000",
  /** "Audiobook" */
  AUDIOBOOK: "txcd_10301000",
  /** "Books" (physical). Stripe's description reads "bound in a stiffer cover"; confirm paperbacks with a tax advisor.
   *  Fallback if ever needed: txcd_99999999 "General - Tangible Goods". */
  PRINT_BOOK: "txcd_35010000",
  /** "Shipping" - delivery charge sold together with physical goods */
  SHIPPING: "txcd_92010001",
  /** Courses (and anything not listed above) still use the old code, which Stripe defines as downloaded
   *  digital audio. NOT confirmed correct for courses: pick the right one from Stripe's list, then change it here. */
  COURSE_UNVERIFIED: "txcd_10401100",
} as const;

export type SaleFormat = "EBOOK" | "AUDIO" | "FLIPBOOK" | "PRINT";

/** Tax code for one direct-sale item. Flipbook is delivered as a downloaded file, so it uses the digital-book code. */
export function taxCodeForFormat(format: SaleFormat | string): string {
  switch (format) {
    case "PRINT":
      return TAX_CODES.PRINT_BOOK;
    case "AUDIO":
      return TAX_CODES.AUDIOBOOK;
    default:
      return TAX_CODES.EBOOK;
  }
}

/** Tax code for a bundle sent as ONE line: only valid when no item is print (mixed bundles are split per item). */
export function taxCodeForDigitalBundle(formats: string[]): string {
  return formats.length > 0 && formats.every((f) => f === "AUDIO") ? TAX_CODES.AUDIOBOOK : TAX_CODES.EBOOK;
}
