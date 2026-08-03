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
        {/* Rendered at 256 and scaled by CSS (react-qr-code's responsive
            pattern) so it stays crisp at any size. Smaller on laptop, where a
            full-size code overpowers the footer. */}
        <QRCode
          value={url}
          size={256}
          viewBox="0 0 256 256"
          level="M"
          bgColor="#FFFFFF"
          fgColor="#111827"
          title={`QR code linking to ${authorName}'s website`}
          className="block h-[104px] w-[104px] lg:h-[80px] lg:w-[80px]"
        />
      </div>
      <p className="text-gray-400 text-xs leading-relaxed max-w-[130px]">
        Scan to open on your phone.
      </p>
    </div>
  );
}
