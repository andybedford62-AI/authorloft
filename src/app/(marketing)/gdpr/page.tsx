import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR & Your Data Rights | AuthorLoft",
  description: "How AuthorLoft complies with the General Data Protection Regulation (GDPR) and your rights as a data subject.",
  openGraph: { type: "website", title: "GDPR & Your Data Rights | AuthorLoft", description: "How AuthorLoft complies with GDPR and your rights as a data subject." },
  twitter:    { card: "summary", title: "GDPR & Your Data Rights | AuthorLoft", description: "How AuthorLoft complies with GDPR and your rights as a data subject." },
};

const SECTIONS = [
  {
    heading: "Who We Are (Data Controller)",
    body: `AuthorLoft is the Data Controller for personal data collected through this platform. We are responsible for deciding how and why your data is processed.

If you have questions about your data or wish to exercise your rights, you can contact us at:

**Email:** hello@authorloft.com
**Website:** https://www.authorloft.com/contact`,
  },
  {
    heading: "What Data We Collect and Why",
    body: `We collect only the data necessary to provide the AuthorLoft service:

**Account data** — name, email address, password (hashed). Used to create and manage your account.

**Author profile data** — biography, profile photo, website links. Used to build your public author page.

**Book catalog data** — book titles, descriptions, cover images, pricing. Used to display your catalog to readers.

**Newsletter subscriber data** — reader email addresses collected through your author site. Stored on your behalf; you own this data.

**Payment data** — processed entirely by Stripe. AuthorLoft never stores card numbers or bank details. Stripe is an independent Data Controller for payment information.

**Usage data** — pages visited, features used, error logs. Used to improve the service and diagnose issues.

**Communications** — emails you send to our support team. Used to respond to your enquiry.`,
  },
  {
    heading: "Legal Basis for Processing",
    body: `We rely on the following legal bases under GDPR Article 6:

**Contract performance (Art. 6(1)(b))** — processing your account, author profile, and book data is necessary to deliver the AuthorLoft service you signed up for.

**Legitimate interests (Art. 6(1)(f))** — usage analytics and security monitoring to maintain a safe, functioning platform.

**Consent (Art. 6(1)(a))** — marketing emails (you can opt out at any time). Cookie consent where applicable.

**Legal obligation (Art. 6(1)(c))** — retaining transaction records as required by applicable tax and financial regulations.`,
  },
  {
    heading: "Your Rights Under GDPR",
    body: `If you are located in the European Economic Area (EEA) or the United Kingdom, you have the following rights:

**Right of access** — you can request a copy of the personal data we hold about you.

**Right to rectification** — you can ask us to correct inaccurate or incomplete data.

**Right to erasure ("right to be forgotten")** — you can ask us to delete your data. We will comply unless we are required to retain it by law (e.g. financial records).

**Right to data portability** — you can request your data in a structured, machine-readable format (CSV or JSON).

**Right to restriction** — you can ask us to pause processing your data while a dispute is resolved.

**Right to object** — you can object to processing based on legitimate interests. We will stop unless we can demonstrate compelling grounds.

**Right to withdraw consent** — where processing is based on consent (e.g. marketing emails), you can withdraw it at any time without affecting the lawfulness of prior processing.

To exercise any of these rights, email us at **hello@authorloft.com** with the subject line "Data Rights Request". We will respond within 30 days.`,
  },
  {
    heading: "Third-Party Data Processors",
    body: `We use the following sub-processors to deliver the AuthorLoft service. Each operates under a Data Processing Agreement (DPA):

**Supabase** — database and authentication hosting. Data stored in data centres with SOC 2 Type II certification. https://supabase.com/privacy

**Stripe** — payment processing. PCI DSS Level 1 certified. Acts as an independent Data Controller for card data. https://stripe.com/privacy

**Vercel** — application hosting and content delivery. https://vercel.com/legal/privacy-policy

**Resend** — transactional email delivery (account emails, notifications). https://resend.com/privacy

We do not sell your data to any third party. We do not use your data for advertising purposes.`,
  },
  {
    heading: "International Data Transfers",
    body: `AuthorLoft and its sub-processors may process data outside the EEA. Where this occurs, we ensure adequate safeguards are in place — such as Standard Contractual Clauses (SCCs) approved by the European Commission — to protect your rights under GDPR.`,
  },
  {
    heading: "Data Retention",
    body: `We retain your data for as long as your account is active. If you close your account:

- Account and profile data is deleted within 30 days.
- Book catalog and subscriber data is deleted within 30 days.
- Transaction and billing records are retained for 7 years to comply with financial regulations.
- Support correspondence is retained for 2 years.

You may request earlier deletion by contacting hello@authorloft.com.`,
  },
  {
    heading: "Cookies",
    body: `AuthorLoft uses essential cookies to keep you signed in and maintain your session. We do not use tracking or advertising cookies without your consent. A consent banner is shown on your first visit where required.

For full details see our Privacy Policy at https://www.authorloft.com/privacy.`,
  },
  {
    heading: "How to Make a Complaint",
    body: `If you believe we have not handled your data correctly, you have the right to lodge a complaint with your local supervisory authority:

**United Kingdom:** Information Commissioner's Office (ICO) — https://ico.org.uk
**European Union:** Your national Data Protection Authority — https://edpb.europa.eu/about-edpb/about-edpb/members_en

We would always prefer to resolve concerns directly — please contact us first at hello@authorloft.com.`,
  },
  {
    heading: "Changes to This Page",
    body: `We may update this page as our practices change or regulations evolve. Material changes will be notified by email or a banner on this site. The date at the top of this page reflects the most recent update.`,
  },
];

export default function GdprPage() {
  const updatedAt = new Date("2026-05-19").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#E8E5DD]">
      {/* Nav */}
      <header className="border-b border-[#DCDBD3] bg-[#E8E5DD] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={200} height={57} className="h-14 w-auto" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AuthorLoft home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1B2B47]">GDPR &amp; Your Data Rights</h1>
          <p className="text-sm text-[#8993A4] mt-2">Last updated: {updatedAt}</p>
          <p className="text-[#5C6E89] mt-4 leading-relaxed">
            AuthorLoft is committed to protecting the personal data of everyone who uses our platform.
            This page explains how we comply with the General Data Protection Regulation (GDPR) and
            the UK GDPR, and how you can exercise your rights as a data subject.
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map(({ heading, body }) => {
            const paragraphs = body.split(/\n\n+/);
            return (
              <div key={heading}>
                <h2 className="text-lg font-bold text-[#1B2B47] mb-3">{heading}</h2>
                <div className="space-y-3">
                  {paragraphs.map((para, i) => {
                    const parts = para.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={i} className="text-[#5C6E89] leading-relaxed">
                        {parts.map((part, j) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={j} className="text-[#1B2B47]">{part.replace(/\*\*/g, "")}</strong>
                            : part
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-[#DCDBD3] flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Privacy Policy →</Link>
          <Link href="/terms"   className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Terms of Service →</Link>
          <Link href="/contact" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Contact us</Link>
        </div>

        {/* Register CTA */}
        <div className="mt-8 rounded-xl bg-[#F0EDE4] border border-[#DCDBD3] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5C6E89]">Ready to build your author site?</p>
          <Link href="/register" className="flex-shrink-0 bg-[#B8893D] text-[#0F1A2D] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D4AE6A] transition-colors">
            Create your free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
