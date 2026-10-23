// External listings/mentions shown in the homepage "proof strip" (heycatch audit D3.5).
// Only add an entry once the page really exists and is live. The strip renders
// these only when the list is non-empty, so nothing is invented in the meantime.
//
// TODO(Andy): add any dated external mention (press, review, Product Hunt) as it is earned.
// `asOf` (e.g. "October 2026") renders as "· as of October 2026" so every badge is dated.
export type ThirdPartyProof = { label: string; href: string; note?: string; asOf?: string };

export const THIRD_PARTY_PROOF: ThirdPartyProof[] = [
  { label: "SaaSHub", href: "https://www.saashub.com/authorloft", note: "Listed", asOf: "October 2026" },
];
