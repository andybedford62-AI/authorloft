"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Download, Loader2, Clock, ArrowLeft, Mail } from "lucide-react";

interface OrderItem {
  downloadToken: string;
  downloadExpiry: string | null;
  downloadsLeft: number;
  hasFile: boolean;
  label: string;
  format: string;
  fileName: string;
  bookTitle: string;
  bookSlug: string;
}

interface OrderStatus {
  status: string;
  customerEmail: string;
  items: OrderItem[];
}

interface SuccessClientProps {
  sessionId: string;
  bookSlug: string;
  accentColor: string;
}

export function SuccessClient({ sessionId, bookSlug, accentColor }: SuccessClientProps) {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 8; // Poll for up to ~16 seconds

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid confirmation link.");
      return;
    }

    async function checkStatus() {
      try {
        const res = await fetch(`/api/orders/status?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Could not find your order.");
          return;
        }

        setOrder(data);

        if (data.status === "PENDING") {
          setAttempts((a) => {
            const next = a + 1;
            if (next < MAX_ATTEMPTS) {
              // Poll again in 2 seconds
              setTimeout(checkStatus, 2000);
            }
            return next;
          });
        }
      } catch {
        setError("Network error. Please refresh the page.");
      }
    }

    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <p className="text-red-600 text-sm">{error}</p>
        <Link href={`/books/${bookSlug}`} className="text-sm text-gray-500 hover:underline">
          Return to book page
        </Link>
      </div>
    );
  }

  // ── Still waiting for webhook ──────────────────────────────────────────────
  const isCompleted = order?.status === "COMPLETED";
  const timedOut = attempts >= MAX_ATTEMPTS && !isCompleted;

  if (!order || (order.status === "PENDING" && !timedOut)) {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-600 font-medium">Confirming your payment…</p>
        <p className="text-sm text-gray-400">This usually takes just a few seconds.</p>
      </div>
    );
  }

  // ── Timed out — payment confirmed by Stripe but webhook delayed ────────────
  if (timedOut) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payment received!</h1>
          <p className="text-sm text-gray-500 mt-2">
            Your payment was successful. We're processing your order — you'll receive a
            confirmation email with your download link shortly.
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400">
          <Mail className="h-4 w-4" />
          Check your email for the download link
        </div>
        <Link
          href={`/books/${bookSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to book
        </Link>
      </div>
    );
  }

  // ── COMPLETED — show download buttons ──────────────────────────────────────
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 text-center space-y-2">
          <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Thank you for your purchase!</h1>
          {order.customerEmail && (
            <p className="text-sm text-gray-500">
              A confirmation has been sent to <strong>{order.customerEmail}</strong>
            </p>
          )}
        </div>

        {/* Download items */}
        <div className="p-6 space-y-3">
          <p className="text-sm font-medium text-gray-700">Your downloads</p>

          {order.items.map((item) => (
            <div
              key={item.downloadToken}
              className="rounded-xl border border-gray-200 p-4 space-y-3"
            >
              <div>
                <p className="font-medium text-gray-900">{item.bookTitle}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>

              {item.hasFile ? (
                <>
                  <a
                    href={`/api/orders/download/${item.downloadToken}`}
                    style={{ backgroundColor: accentColor }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
                  >
                    <Download className="h-4 w-4" />
                    Download {item.label}
                  </a>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.downloadExpiry
                        ? `Link expires ${new Date(item.downloadExpiry).toLocaleDateString()}`
                        : "No expiry"}
                    </span>
                    <span>{item.downloadsLeft} download{item.downloadsLeft !== 1 ? "s" : ""} remaining</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Your file is being prepared. Check back shortly or watch your email.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link
          href={`/books/${bookSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to book page
        </Link>
      </div>
    </div>
  );
}
