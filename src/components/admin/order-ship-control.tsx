"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  orderId: string;
  shippedAt: string | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
};

/** "Mark as shipped" control for a print order on Admin → Sales. Emails the buyer when marked shipped. */
export function OrderShipControl({ orderId, shippedAt, trackingCarrier, trackingNumber }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [carrier, setCarrier] = useState(trackingCarrier ?? "");
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (shippedAt && !open) {
    return (
      <div className="mt-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1 font-medium text-green-700">
          <Check className="h-3.5 w-3.5" /> Shipped {new Date(shippedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        {(trackingCarrier || trackingNumber) && (
          <span className="ml-2 text-gray-500">{[trackingCarrier, trackingNumber].filter(Boolean).join(" ")}</span>
        )}
        <button type="button" onClick={() => setOpen(true)} className="ml-2 text-blue-600 hover:underline">Edit</button>
        <button type="button" onClick={() => send({ undo: true })} disabled={busy} className="ml-2 text-gray-400 hover:text-gray-600 hover:underline">Undo</button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-2">
        <span className="mr-2 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">Needs shipping</span>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
          <Truck className="h-3.5 w-3.5" /> Mark as shipped
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-wrap gap-2">
        <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier (optional)" className="w-40" maxLength={60} aria-label="Carrier" />
        <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number (optional)" className="w-56" maxLength={100} aria-label="Tracking number" />
      </div>
      <p className="text-xs text-gray-500">The buyer gets an email saying it has shipped, with the tracking if you add it.</p>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => send({ carrier, trackingNumber: tracking })} disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : shippedAt ? "Save tracking" : "Mark shipped & email buyer"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
