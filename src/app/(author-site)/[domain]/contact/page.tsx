import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ContactForm } from "./contact-form";
import { Mail, Clock } from "lucide-react";
import { PageBanner } from "@/components/author-site/page-banner";
import { getThemeAccentHex } from "@/lib/themes";
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
      siteTheme: true,
    },
  });

  if (!author) notFound();

  const displayName = author.displayName || author.name;

  const accentColor = getThemeAccentHex(author.siteTheme);

  return (
    <div>

      <PageBanner
        label="Get in Touch"
        title={`Contact ${displayName}`}
        subtitle="Whether you're a reader, a media contact, or interested in collaboration — I'd love to hear from you."
      />

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
