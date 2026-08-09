"use client";

import { useState } from "react";
import { FileDown, Loader2, X } from "lucide-react";
import { UNLOCK_COOKIE } from "@/lib/downloads";

function hasUnlockCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${UNLOCK_COOKIE}=`));
}

export function DownloadButton({
  id,
  title,
  requiresEmail,
  className,
}: {
  id: string;
  title: string;
  requiresEmail: boolean;
  className?: string;
}) {
  const [open, setOpen]       = useState(false);
  const [email, setEmail]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function go() {
    // Browser follows the 302 from the proxy to the real file.
    window.location.href = `/api/downloads/${id}`;
  }

  function handleClick() {
    if (!requiresEmail || hasUnlockCookie()) { go(); return; }
    setError(null);
    setOpen(true);
  }

  async function submitEmail() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/downloads/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resourceId: id, source: "resource" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Something went wrong."); setBusy(false); return; }
      setOpen(false);
      go();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        <FileDown className="h-4 w-4" /> Download
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-serif text-lg text-[#1B2B47]">Get your free download</h3>
              <button onClick={() => !busy && setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-[#5C6E89]">
                Enter your email to unlock <strong className="text-[#1B2B47]">{title}</strong>.
                You&apos;ll only need to do this once — future downloads are instant.
              </p>
              <div>
                <input
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitEmail(); }}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C26A4A]"
                />
                {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2 mt-2">{error}</p>}
              </div>
              <button
                onClick={submitEmail}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-5 py-2.5 rounded-full hover:bg-[#D4AE6A] transition-colors disabled:opacity-50"
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Unlocking…</> : <>Unlock &amp; download →</>}
              </button>
              <p className="text-[11px] text-[#9b8e7e] text-center">
                We&apos;ll occasionally email you helpful resources. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
