import Link from "next/link";
import { prisma } from "@/lib/db";
import { ResendButton } from "./resend-button";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

interface Props {
  searchParams: Promise<{ token?: string; reason?: string }>;
}

export default async function ExpiredPage({ searchParams }: Props) {
  const { token, reason } = await searchParams;
  const isLimit = reason === "limit";

  let bookTitle: string | null = null;
  let maskedEmail: string | null = null;
  let validToken = false;

  if (token) {
    const item = await prisma.orderItem.findFirst({
      where: { downloadToken: token },
      select: {
        book: { select: { title: true } },
        order: { select: { status: true, customerEmail: true } },
      },
    });

    if (item && item.order.status === "COMPLETED" && item.order.customerEmail) {
      validToken = true;
      bookTitle = item.book.title;
      maskedEmail = maskEmail(item.order.customerEmail);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">

        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-2xl">
          {isLimit ? "📥" : "⏱"}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            {isLimit ? "Download limit reached" : "Download link expired"}
          </h1>
          {bookTitle && (
            <p className="text-sm text-gray-500">
              <strong className="text-gray-700">{bookTitle}</strong>
            </p>
          )}
          <p className="text-sm text-gray-500">
            {isLimit
              ? "You've used all available downloads for this link."
              : "This download link is no longer active."}
          </p>
        </div>

        {validToken && token && maskedEmail ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We can send a new download link to{" "}
              <strong className="text-gray-800">{maskedEmail}</strong>
            </p>
            <ResendButton token={token} />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the email you used to purchase and we'll resend your download link.
            </p>
            <Link
              href="/orders/lookup"
              className="inline-block w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Look up my order
            </Link>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Need help?{" "}
          <a href="mailto:support@authorloft.com" className="text-blue-500 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
