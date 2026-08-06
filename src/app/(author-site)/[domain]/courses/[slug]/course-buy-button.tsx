"use client";

import { useState } from "react";
import { Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCSRFToken } from "@/hooks/use-csrf-token";

interface CourseBuyButtonProps {
  courseId: string;
  priceCents: number;
  accentColor: string;
}

export function CourseBuyButton({ courseId, priceCents, accentColor }: CourseBuyButtonProps) {
  const csrfToken = useCSRFToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleBuy() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFreeEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (data.accessUrl) {
        window.location.href = data.accessUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (priceCents === 0) {
    if (!showEmailForm) {
      return (
        <div>
          <Button
            onClick={() => setShowEmailForm(true)}
            className="w-full text-base py-6"
            style={{ backgroundColor: accentColor }}
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Enroll for Free
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleFreeEnroll} className="space-y-3">
        <p className="text-xs text-gray-500">
          Enter your email to get instant access — you&apos;ll go straight into the course, and
          we&apos;ll also send the link to your inbox so you can pick up where you left off later.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full text-base py-6"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <GraduationCap className="h-5 w-5 mr-2" />
          )}
          Get Access
        </Button>
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
      </form>
    );
  }

  return (
    <div>
      <Button
        onClick={handleBuy}
        disabled={loading}
        className="w-full text-base py-6"
        style={{ backgroundColor: accentColor }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <GraduationCap className="h-5 w-5 mr-2" />
        )}
        Enroll — ${(priceCents / 100).toFixed(2)}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
