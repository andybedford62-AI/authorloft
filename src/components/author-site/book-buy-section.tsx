"use client";

import { useState, useEffect } from "react";
import { isDemoMode } from "@/lib/demo-mode";
import { Lock } from "lucide-react";

interface BookBuySectionProps {
  children: React.ReactNode;
}

export function BookBuySection({ children }: BookBuySectionProps) {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  if (isDemo) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center gap-3 text-gray-600">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Purchase features are disabled in demo mode</p>
            <p className="text-xs mt-1">
              <a href="/pricing" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                View pricing
              </a>
              {" "}to start your paid plan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
