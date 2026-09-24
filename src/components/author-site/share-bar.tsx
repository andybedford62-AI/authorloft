"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Facebook, Link2, Mail, MessageCircle, QrCode, Share2, Twitter, X } from "lucide-react";
import { shareIntentUrl, taggedUrl, type ShareNetwork } from "@/lib/share";

// One share bar for every public page with something to share: books, courses
// and music lists. Every link is UTM-tagged so the author's Traffic Sources
// show which button (or network) brought the visitor.

/**
 * Native share sheet where the device has one (that's the only web route into
 * TikTok and Instagram), else copy. Resolves to what happened so the caller
 * can show "Link copied"; a dismissed share sheet resolves to null.
 */
export async function shareOrCopy(url: string, title: string, text: string): Promise<"shared" | "copied" | null> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ url, title, text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return null;
      // Any other failure (e.g. share blocked in an iframe) falls through to copy.
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return null;
  }
}

const NETWORKS: { id: ShareNetwork; label: string; icon?: typeof Facebook }[] = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "x",        label: "X",        icon: Twitter },
  { id: "threads",  label: "Threads" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "reddit",   label: "Reddit" },
  { id: "email",    label: "Email",    icon: Mail },
];

export function ShareBar({
  url,
  title,
  text,
  campaign,
  accentSurface,
}: {
  /** Clean canonical URL — tags are added per network. */
  url: string;
  title: string;
  /** Prefilled post text, e.g. `Listen to "Road Songs", the new album by Jo`. */
  text: string;
  /** utm_campaign — the item's slug. */
  campaign: string;
  accentSurface: string;
}) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Checked after mount: navigator doesn't exist during SSR, and rendering the
  // button conditionally on the server would mismatch on hydration.
  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  // The QR popover closes on Escape or a click anywhere outside it.
  useEffect(() => {
    if (!qrOpen) return;
    const onDown = (e: MouseEvent) => {
      if (qrRef.current && !qrRef.current.contains(e.target as Node)) setQrOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQrOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [qrOpen]);

  async function handleNative() {
    const result = await shareOrCopy(taggedUrl(url, "share-sheet", campaign, "share"), title, text);
    if (result === "copied") flashCopied();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(taggedUrl(url, "copy-link", campaign, "share"));
      flashCopied();
    } catch {
      /* clipboard blocked — nothing useful to show */
    }
  }

  function flashCopied() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pill =
    "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share">
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNative}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentSurface }}
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      )}
      <button type="button" onClick={handleCopy} className={pill}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      {NETWORKS.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={shareIntentUrl(id, taggedUrl(url, id, campaign), text)}
          target={id === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={pill}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </a>
      ))}

      {/* QR: mostly for handing a page from a laptop to a phone, or to someone
          standing next to you. Tagged "qr" so scans show as "QR code". */}
      <div ref={qrRef} className="relative">
        <button
          type="button"
          onClick={() => setQrOpen((v) => !v)}
          className={pill}
          aria-expanded={qrOpen}
          aria-haspopup="dialog"
        >
          <QrCode className="h-3.5 w-3.5" /> QR code
        </button>
        {qrOpen && (
          <div
            role="dialog"
            aria-label={`QR code for ${title}`}
            className="absolute z-30 right-0 sm:right-auto sm:left-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-xs text-gray-500">Scan to open this page on your phone.</p>
              <button
                type="button"
                onClick={() => setQrOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close QR code"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex justify-center">
              <QRCode value={taggedUrl(url, "qr", campaign, "share")} size={168} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
