import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ContactForm } from "./contact-form";
import { Mail, Clock, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await prisma.author.findFirst({
    where: { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
    select: { displayName: true, name: true },
  });
  if (!author) return { title: "Contact" };
  const authorName = author.displayName || author.name;
  return {
    title: "Contact",
    description: `Get in touch with ${authorName} — reader questions, media inquiries, speaking engagements, and more.`,
    openGraph: { title: `Contact ${authorName}`, description: `Send a message to ${authorName}.` },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const author = await prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    select: {
      id: true,
      displayName: true,
      name: true,
      contactEmail: true,
      accentColor: true,
    },
  });

  if (!author) notFound();

  const displayName = author.displayName || author.name;

  const accentColor = author.accentColor ?? "#7B2D2D";

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Page Banner ──────────────────────────────────────────────────── */}
      <section className="w-full py-12 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-6 w-6 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              Get in Touch
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Contact {displayName}</h1>
          <p className="text-white/75 mt-2 max-w-xl">
            Whether you&apos;re a reader, a media contact, or interested in collaboration — I&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Contact Content ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Response Time</p>
                  <p className="text-sm text-gray-500">Typically within 24–48 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Open to</p>
                  <p className="text-sm text-gray-500">
                    Reader questions, media inquiries, speaking engagements, and
                    book club discussions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: live contact form */}
          <ContactForm domain={domain} />
        </div>
      </div>
    </div>
  );
}
