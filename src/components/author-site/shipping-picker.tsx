"use client";

import { useEffect, useState } from "react";
import { Truck, Loader2 } from "lucide-react";
import { useCSRFToken } from "@/hooks/use-csrf-token";
import { formatCents } from "@/lib/utils";

export type ShippingSelection = {
  hasPrint: boolean;
  country: string;
  /** null until a deliverable country is chosen */
  amountCents: number | null;
  /** true when checkout may proceed (no print item, or a shippable country is chosen) */
  ready: boolean;
};

export const NO_SHIPPING: ShippingSelection = { hasPrint: false, country: "", amountCents: 0, ready: true };

const COUNTRY_KEY = "authorloft_ship_country";

type QuoteResponse = {
  hasPrint: boolean;
  countries: { code: string; name: string }[];
  quote?:
    | { ok: true; amountCents: number; freeApplied: boolean; estimateNotes: string[] }
    | { ok: false; message: string };
};

/**
 * "Where should we send it?" step for carts/buy buttons that contain a Print edition. Renders nothing
 * for digital-only purchases. Postage shown here is a preview; checkout recomputes it on the server.
 */
export function ShippingPicker({
  saleItemIds,
  bundleId,
  onChange,
}: {
  saleItemIds?: string[];
  bundleId?: string;
  onChange: (s: ShippingSelection) => void;
}) {
  const csrfToken = useCSRFToken();
  const [country, setCountry] = useState("");
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const idsKey = saleItemIds?.join(",") ?? "";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTRY_KEY);
      if (saved) setCountry(saved);
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    if (!bundleId && !idsKey) { setData(null); onChange(NO_SHIPPING); return; }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(csrfToken && { "X-CSRF-Token": csrfToken }) },
      body: JSON.stringify({ ...(bundleId ? { bundleId } : { saleItemIds: idsKey.split(",") }), ...(country && { country }) }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("quote failed"))))
      .then((d: QuoteResponse) => {
        if (cancelled) return;
        setData(d);
        if (!d.hasPrint) { onChange(NO_SHIPPING); return; }
        const q = d.quote;
        onChange({ hasPrint: true, country, amountCents: q?.ok === true ? q.amountCents : null, ready: q?.ok === true });
      })
      .catch(() => { if (!cancelled) { setFailed(true); onChange({ hasPrint: true, country, amountCents: null, ready: false }); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // onChange is a state setter from the parent; csrfToken arrives async
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, bundleId, country, csrfToken]);

  if (!data?.hasPrint) return null;

  const quote = data.quote;
  const countryStillValid = !country || data.countries.some((c) => c.code === country);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700" htmlFor="ship-country">
        <Truck className="h-3.5 w-3.5" /> Deliver the print edition to
      </label>
      <select
        id="ship-country"
        value={countryStillValid ? country : ""}
        onChange={(e) => {
          setCountry(e.target.value);
          try { localStorage.setItem(COUNTRY_KEY, e.target.value); } catch { /* ignore */ }
        }}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">Select a country…</option>
        {data.countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
      </select>
      {data.countries.length === 0 && (
        <p className="text-xs text-amber-700">Shipping isn&apos;t available for the print edition right now.</p>
      )}
      {loading && <p className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Calculating shipping…</p>}
      {!loading && country && quote?.ok === true && (
        <p className="text-xs text-gray-600">
          Shipping: <strong>{quote.amountCents === 0 ? "Free" : formatCents(quote.amountCents)}</strong>
          {quote.estimateNotes.length > 0 && <span className="text-gray-400"> · {quote.estimateNotes.join(", ")}</span>}
        </p>
      )}
      {!loading && country && quote?.ok === false && <p className="text-xs text-red-600">{quote.message}</p>}
      {failed && <p className="text-xs text-red-600">Couldn&apos;t calculate shipping. Please try again.</p>}
    </div>
  );
}
