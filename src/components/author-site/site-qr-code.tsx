"use client";

import QRCode from "react-qr-code";

/**
 * Footer QR pointing at the author's site root, so a visitor on desktop can
 * carry the site to their phone — and an author can hold their screen out at a
 * signing or conference for someone to scan.
 *
 * Rendered on a white plate: QR codes need a light quiet zone to scan reliably,
 * and the footer panel is near-black.
 */
export function SiteQrCode({ url, authorName }: { url: string; authorName: string }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Visit on Mobile
      </p>
      <div className="inline-block bg-white p-2 rounded-md">
        <QRCode
          value={url}
          size={104}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#111827"
          title={`QR code linking to ${authorName}'s website`}
        />
      </div>
      <p className="text-gray-400 text-xs leading-relaxed max-w-[140px]">
        Scan with your camera to open this site on your phone.
      </p>
    </div>
  );
}
