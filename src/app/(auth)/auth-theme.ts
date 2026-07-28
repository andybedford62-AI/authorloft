/**
 * Shared visual tokens for the auth flow (login, register, password reset,
 * verify, accept terms).
 *
 * These pages shipped as stock Tailwind: `bg-gray-50` page, `bg-white
 * rounded-2xl border-gray-200` card, and `#2563EB` (Tailwind blue) as the
 * primary action — none of which is AuthorLoft's brand. The marketing site runs
 * navy + brass + cream (see globals.css --navy/--cream and the marketing hero
 * palette), so signing in looked like a different product than the site that
 * sent you there, in the most generic default a generator produces.
 *
 * Anchored to the real brand instead. Kept light: the logo PNG has an opaque
 * near-white background, so it can't sit on a dark surface.
 */

export const AUTH_INK = "#0F1A2D";   // near-black navy — button text, headings
export const AUTH_BRASS = "#B8893D"; // brand gold — primary actions
export const AUTH_LINK = "#8A6520";  // darker brass, AA-contrast on white

/**
 * Warm page field, distinct from Tailwind's stock neutral gray-50. Also sets
 * --accent for the whole flow, which the shared Input already consumes for its
 * focus ring — so inputs, buttons, and focus states all resolve to brass from
 * one place instead of each hardcoding Tailwind blue.
 */
export const authPageStyle = {
  backgroundColor: "#F7F4ED",
  "--accent": AUTH_BRASS,
} as React.CSSProperties;

/**
 * Card surface. A deliberate 10px radius rather than the blanket `rounded-2xl`
 * every generated auth page uses, with a warm hairline instead of gray-200.
 */
export const authCardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 10,
  border: "1px solid #E7E0D3",
  boxShadow: "0 1px 2px rgba(15,26,45,0.04)",
} as const;

/**
 * Primary button. Background comes from --accent (set on the page wrapper); the
 * Button component hardcodes `text-white`, which fails contrast on brass, so
 * colour is overridden inline — an inline style beats the class.
 */
export const authPrimaryStyle = { color: AUTH_INK } as React.CSSProperties;

/**
 * Inline notice. Replaces the stock `bg-amber-50 border-amber-200` alert box —
 * a left rule reads as an editorial aside rather than the default alert recipe.
 */
export const authNoticeStyle = {
  borderLeft: `2px solid ${AUTH_BRASS}`,
  backgroundColor: "#FBF7EE",
  color: "#5C4718",
} as const;
