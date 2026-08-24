import { Suspense } from "react";
import { SuccessClient } from "@/components/author-site/success-client";
import { getAuthorByDomain } from "@/lib/author-queries";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

// Transactional page — never a search result. The layout used to point its
// canonical at the site root, which suppressed it as a side effect; now that
// the cascade is gone it needs to say so explicitly.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CartSuccessPage({ params, searchParams }: Props) {
  const { domain } = await params;
  const { session_id } = await searchParams;

  const author = await getAuthorByDomain(domain).catch(() => null);
  const accentColor = author?.accentColor || "#7B2D2D";

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <Suspense>
        <SuccessClient
          sessionId={session_id ?? ""}
          accentColor={accentColor}
          clearOnMount
        />
      </Suspense>
    </div>
  );
}
