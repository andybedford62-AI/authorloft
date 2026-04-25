import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Maintenance | AuthorLoft",
  robots: { index: false },
};

// Always fetch fresh so the page reflects the latest message
export const dynamic = "force-dynamic";

async function getMessage() {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: "main" } });
    return config?.maintenanceMessage ?? "";
  } catch {
    return "";
  }
}

export default async function MaintenancePage() {
  const message = await getMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060d1f] via-[#0d1b3e] to-[#0a1a3a] flex flex-col items-center justify-center px-4 text-white">

      {/* Background blobs */}
      <div className="absolute -top-48 -right-48 w-[36rem] h-[36rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/AL_site_Logo-Dark_footer.png"
            alt="AuthorLoft"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-white/8 border border-white/15 flex items-center justify-center backdrop-blur-sm">
            <svg className="h-9 w-9 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.292-5.292-1.416.527a1.5 1.5 0 0 1-1.737-.43L9.75 3.75l-1.036 5.73A1.5 1.5 0 0 1 7.5 10.5H4.875" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            We&apos;re temporarily offline
          </h1>
          <p className="text-blue-100/70 text-lg leading-relaxed">
            AuthorLoft is undergoing scheduled maintenance and will be back online shortly.
            Thank you for your patience.
          </p>
        </div>

        {/* Custom admin message */}
        {message && (
          <div className="bg-white/8 border border-white/15 rounded-xl px-6 py-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 rounded-full px-5 py-2.5 text-sm text-blue-200 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
          Maintenance in progress
        </div>

        {/* Marketing page link — stays accessible */}
        <p className="text-xs text-blue-300/50">
          You can still{" "}
          <a href="https://www.authorloft.com" className="underline underline-offset-2 hover:text-blue-200 transition-colors">
            browse the AuthorLoft homepage
          </a>
          {" "}while we work.
        </p>
      </div>
    </div>
  );
}
