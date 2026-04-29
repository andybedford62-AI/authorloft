import { Suspense } from "react";
import { SuccessClient } from "@/components/author-site/success-client";
import { getAuthorByDomain } from "@/lib/author-queries";

interface Props {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

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
