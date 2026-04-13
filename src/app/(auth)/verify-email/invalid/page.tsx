import Link from "next/link";
import { BookOpen, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailInvalidPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">
              Author<span className="text-blue-600">Loft</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="bg-red-50 rounded-full p-4">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Link expired or invalid</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This verification link has expired or has already been used. Verification links are valid for 24 hours.
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              style={{ "--accent": "#2563EB" } as React.CSSProperties}
            >
              Go to dashboard to resend
            </Button>
          </Link>
          <p className="text-xs text-gray-400">
            Already verified?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
