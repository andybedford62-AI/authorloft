"use client";

import { STRIPE_CONNECT_COUNTRIES } from "@/lib/stripe-connect-countries";

/**
 * Country picker for Stripe Connect onboarding. `placeholder` adds a leading
 * empty option (value "") for callers that only want to send a country when
 * the author actually changes it.
 */
export function StripeCountrySelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs text-gray-600">
      <span className="font-medium">Country where your bank account is</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {STRIPE_CONNECT_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>
    </label>
  );
}
