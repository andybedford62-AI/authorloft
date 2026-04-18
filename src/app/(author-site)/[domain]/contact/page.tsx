import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ContactForm } from "./contact-form";
import { Mail, Clock, MessageSquare } from "lucide-react";
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
      contactResponseTime: true,
      contactOpenTo: true,
      siteTheme: true,
      linkedinUrl: true,
      youtubeUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      instagramUrl: true,
    },
  });

  if (!author) notFound();

  const displayName = author.displayName || author.name;
  const accentColor = getThemeAccentHex(author.siteTheme);

  const responseTime = author.contactResponseTime || "Typically within 24–48 hours";
  const openTo      = author.contactOpenTo || "Reader questions, media inquiries, speaking engagements, and book club discussions.";

  const socialLinks = [
    { href: author.linkedinUrl,  label: "LinkedIn"    },
    { href: author.twitterUrl,   label: "X / Twitter" },
    { href: author.instagramUrl, label: "Instagram"   },
    { href: author.facebookUrl,  label: "Facebook"    },
    { href: author.youtubeUrl,   label: "YouTube"     },
  ].filter((s): s is { href: string; label: string } => !!s.href);

  return (
    <div>
      <PageBanner
        label="Get in Touch"
        title={`Contact ${displayName}`}
        subtitle="Whether you're a reader, a media contact, or interested in collaboration — I'd love to hear from you."
        accentColor={accentColor}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8 items-start">

          {/* ── Left info card ─────────────────────────────────────────────── */}
          <div
            className="md:col-span-2 rounded-2xl p-6 space-y-6 text-white"
            style={{ backgroundColor: "var(--nav-bg, #1a2236)" }}
          >
            <div>
              <h2 className="text-lg font-bold text-white">{displayName}</h2>
              <p className="text-sm text-white/60 mt-0.5">Contact Information</p>
            </div>

            {/* Email */}
            {author.contactEmail && (
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: accentColor + "30" }}
                >
                  <Mail className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Email</p>
                  <a
                    href={`mailto:${author.contactEmail}`}
                    className="text-sm text-white hover:opacity-80 transition-opacity break-all"
                    style={{ color: accentColor }}
                  >
                    {author.contactEmail}
                  </a>
                </div>
              </div>
            )}

            {/* Response time */}
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accentColor + "30" }}
              >
                <Clock className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Response Time</p>
                <p className="text-sm text-white/80 mt-0.5">{responseTime}</p>
              </div>
            </div>

            {/* Open to */}
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accentColor + "30" }}
              >
                <MessageSquare className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Open to</p>
                <p className="text-sm text-white/80 mt-0.5">{openTo}</p>
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">Follow</p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: accentColor + "25",
                        color: accentColor,
                        border: `1px solid ${accentColor}50`,
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: contact form ────────────────────────────────────────── */}
          <div className="md:col-span-3">
            <ContactForm domain={domain} accentColor={accentColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
