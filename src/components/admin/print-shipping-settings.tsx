"use client";

import { useEffect, useState } from "react";
import { Package, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Settings card: the flat shipping fee added at checkout when a cart has a Print edition. */
export function PrintShippingSettings() {
  const [dollars, setDollars] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/print-shipping")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.printShippingCents === "number") setDollars((d.printShippingCents / 100).toFixed(2));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function save() {
    setError("");
    setSaved(false);
    const trimmed = dollars.trim();
    const value = trimmed === "" ? 0 : Math.round(parseFloat(trimmed) * 100);
    if (!Number.isFinite(value) || value < 0 || value > 10000) {
      setError("Enter an amount between $0 and $100.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/print-shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printShippingCents: value }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save. Please try again.");
      }
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          Print shipping
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          A flat fee added once per order when a reader buys a Print edition. You print and ship the copy yourself, so
          set this to cover postage. Leave it empty for free shipping. It applies to every country you ship to.
        </p>
      </div>

      {!loaded ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label htmlFor="print-shipping" className="block text-sm font-medium text-gray-700">Flat shipping fee (USD)</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <Input
                id="print-shipping"
                inputMode="decimal"
                value={dollars}
                onChange={(e) => { setDollars(e.target.value); setSaved(false); }}
                placeholder="0.00"
                className="w-28"
              />
            </div>
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Check className="h-4 w-4 mr-1" /> Saved</> : "Save"}
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
