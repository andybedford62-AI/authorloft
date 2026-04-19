import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="bg-green-50 rounded-full p-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Email verified!</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Your email address has been confirmed. Your AuthorLoft account is fully activated.
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              style={{ "--accent": "#2563EB" } as React.CSSProperties}
            >
              Go to your dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
