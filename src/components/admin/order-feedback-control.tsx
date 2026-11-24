"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareHeart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  buyerFirstName: string | null;
  authorName: string;
  titles: string[];
  followUpSentAt: string | null;
  /** Timing nudge (e.g. "Bought 2 days ago…"); advisory only, never blocks sending. */
  hint: string | null;
};

function titleList(titles: string[]): string {
  const q = titles.slice(0, 3).map((t) => `“${t}”`);
  if (q.length <= 1) return q[0] ?? "your order";
  return `${q.slice(0, -1).join(", ")} and ${q[q.length - 1]}`;
}

function defaultMessage({ buyerFirstName, authorName, titles }: Pick<Props, "buyerFirstName" | "authorName" | "titles">) {
  return [
    `Hi ${buyerFirstName || "there"},`,
    ``,
    `Thanks again for picking up ${titleList(titles)}. If you've had a chance to enjoy it, I'd love to hear what you thought. A quick star rating, and a line or two if you feel like it, helps other readers find it and means a lot to me.`,
    ``,
    `If you'd rather tell me directly, just reply to this email.`,
    ``,
    authorName,
  ].join("\n");
}

/** "Thank & ask for feedback" control for an order on Admin → Sales. Emails the buyer once (resend is explicit). */
export function OrderFeedbackControl({ orderId, buyerFirstName, authorName, titles, followUpSentAt, hint }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(() => defaultMessage({ buyerFirstName, authorName, titles }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alreadySent = !!followUpSentAt;

  async function send() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/feedback-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, resend: alreadySent }),
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

  if (!open) {
    return (
      <div className="mt-2 text-xs">
        {alreadySent && (
          <span className="mr-2 inline-flex items-center gap-1 font-medium text-green-700">
            <Check className="h-3.5 w-3.5" /> Asked {new Date(followUpSentAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline">
          <MessageSquareHeart className="h-3.5 w-3.5" /> {alreadySent ? "Send again" : "Thank & ask for feedback"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      {hint && <p className="text-xs text-amber-700">{hint}</p>}
      <textarea
        value={message}
        onChange={(e) => { setMessage(e.target.value); setError(""); }}
        rows={9}
        maxLength={1500}
        aria-label="Message to the buyer"
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500">
        A “Rate …” button is added for {titles.length > 1 ? "each item" : "the item"}, and replies come to you.
        {alreadySent && " This buyer was already asked once — sending again emails them a second time."}
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={send} disabled={busy || !message.trim()}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : alreadySent ? "Send again" : "Send"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
