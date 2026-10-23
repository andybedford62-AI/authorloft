/**
 * Countries an author can ship print copies to, and a buyer can pick as a destination.
 * Codes are ISO 3166-1 alpha-2 and must be accepted by Stripe Checkout's
 * `shipping_address_collection.allowed_countries`. Territories under comprehensive sanctions
 * (CU, IR, KP, SY, and occupied regions) are left out on purpose.
 */
export const SHIPPING_COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" }, { code: "CA", name: "Canada" }, { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" }, { code: "NZ", name: "New Zealand" }, { code: "IE", name: "Ireland" },
  { code: "AL", name: "Albania" }, { code: "AR", name: "Argentina" }, { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" }, { code: "BG", name: "Bulgaria" }, { code: "BR", name: "Brazil" },
  { code: "CH", name: "Switzerland" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "CR", name: "Costa Rica" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" }, { code: "DE", name: "Germany" }, { code: "DK", name: "Denmark" },
  { code: "DO", name: "Dominican Republic" }, { code: "EE", name: "Estonia" }, { code: "EG", name: "Egypt" },
  { code: "ES", name: "Spain" }, { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "GH", name: "Ghana" }, { code: "GR", name: "Greece" }, { code: "HK", name: "Hong Kong" },
  { code: "HR", name: "Croatia" }, { code: "HU", name: "Hungary" }, { code: "ID", name: "Indonesia" },
  { code: "IL", name: "Israel" }, { code: "IN", name: "India" }, { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" }, { code: "KR", name: "South Korea" }, { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" }, { code: "LV", name: "Latvia" },
  { code: "MA", name: "Morocco" }, { code: "MT", name: "Malta" }, { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" }, { code: "NG", name: "Nigeria" }, { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" }, { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" }, { code: "RS", name: "Serbia" }, { code: "SA", name: "Saudi Arabia" },
  { code: "SE", name: "Sweden" }, { code: "SG", name: "Singapore" }, { code: "SI", name: "Slovenia" },
  { code: "SK", name: "Slovakia" }, { code: "TH", name: "Thailand" }, { code: "TR", name: "Türkiye" },
  { code: "TW", name: "Taiwan" }, { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" },
  { code: "UY", name: "Uruguay" }, { code: "VN", name: "Vietnam" }, { code: "ZA", name: "South Africa" },
];

const NAME_BY_CODE = new Map(SHIPPING_COUNTRIES.map((c) => [c.code, c.name]));

export function countryName(code: string): string {
  return NAME_BY_CODE.get(code) ?? code;
}

export function isShippableCountry(code: string): boolean {
  return NAME_BY_CODE.has(code);
}
