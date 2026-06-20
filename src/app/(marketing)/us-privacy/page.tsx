"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

export const dynamic = "force-static";

// Metadata is exported separately from a server component; because this page
// is mostly static content we keep it as a client component for consistency
// with the GDPR page pattern but export metadata via a sibling layout if needed.
// For now the canonical/OG tags are handled by the root layout defaults.

const SECTIONS = [
  {
    heading: "Overview",
    body: `A growing number of U.S. states have enacted comprehensive consumer data privacy laws. While many of these laws apply only to businesses that meet certain size or volume thresholds (AuthorLoft is a small platform and may not be legally required to comply with all of them), we believe every user deserves transparency and control over their data — regardless of where they live.

This page explains the rights available to U.S. residents under state privacy laws and how to exercise them with AuthorLoft.

**Laws covered:** California CCPA/CPRA · Virginia VCDPA · Colorado CPA · Connecticut CTDPA · Utah UCPA · Texas TDPSA · Oregon OCPA · Montana MCDPA · Delaware DPDPA · Iowa ICDPA · Nebraska NDPA · New Hampshire NHPA · New Jersey NJDPA · Tennessee TIPA · Minnesota MNDPA · Maryland MODPA · Indiana ICDPA · Kentucky KCPA`,
  },
  {
    heading: "We Do Not Sell Your Personal Data",
    body: `AuthorLoft does not sell, rent, or trade your personal information to third parties for monetary or other valuable consideration.

We do not use your data for cross-context behavioral advertising. We do not share your data with data brokers.

California residents: this means you do not need to opt out of a "sale" — there is nothing to opt out of.

If this ever changes, we will update this page, notify you, and provide an opt-out mechanism before any such activity begins.`,
  },
  {
    heading: "Personal Data We Collect",
    body: `We collect only what is necessary to provide the AuthorLoft service:

**Identifiers** — name, email address, username.

**Account credentials** — passwords (stored as irreversible hashes; never readable by us).

**Author profile data** — biography, profile photo, social media links. Used to build your public author page.

**Book and content data** — book titles, descriptions, cover images, pricing, blog posts. Content you create and own.

**Transaction data** — order history, amounts, formats purchased. Payment card details are processed and stored exclusively by Stripe; we never see or store them.

**Reader newsletter subscribers** — email addresses collected through author subscription forms. These belong to the author, not AuthorLoft.

**Usage and device data** — pages visited, features used, browser type, IP address, error logs. Used to operate and improve the platform.

**Communications** — messages sent to our support team, contact form submissions.`,
  },
  {
    heading: "Your Rights Under U.S. State Privacy Laws",
    body: `Most state privacy laws grant residents one or more of the following rights. We honour these requests for all U.S. users, not just residents of states with enacted laws.

**Right to Know / Right of Access**
You can request a copy of the personal data we hold about you, including the categories of data, the purposes for which it is used, and the third parties with whom it is shared.

**Right to Correct**
You can ask us to correct inaccurate personal data. Most profile and account data can be corrected directly in your admin settings without contacting us.

**Right to Delete**
You can ask us to delete your personal data. We will comply unless we are required to retain it (e.g. transaction records for tax and legal compliance). Deletion of an author account results in removal of all books, subscribers, and site content.

**Right to Data Portability**
You can request your data in a structured, machine-readable format (CSV or JSON). Authors can export their newsletter subscriber list from the admin dashboard at any time.

**Right to Opt Out of Sale / Sharing / Targeted Advertising**
As noted above, we do not sell or share your data for advertising purposes, so there is nothing to opt out of.

**Right to Limit Use of Sensitive Personal Data** (California CPRA, Colorado, others)
We do not collect sensitive personal data categories (race, religion, biometric data, precise geolocation, health information, etc.) as part of normal platform use.

**Right to Non-Discrimination**
Exercising any of these rights will never result in denial of service, different pricing, or lower quality of service.

**Right to Appeal** (Virginia, Colorado, Connecticut, Texas, others)
If we decline your request, you may appeal by contacting us and referencing "Privacy Rights Appeal" in the subject line. We will respond within the timeframe required by your state's law.`,
  },
  {
    heading: "California Residents (CCPA / CPRA)",
    body: `California residents have additional rights and disclosures under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).

**Categories of personal information collected in the past 12 months:**
- Identifiers (name, email address, IP address)
- Commercial information (purchase history, subscription plan)
- Internet or electronic network activity (pages viewed, features used)
- Inferences drawn from the above to understand user preferences

**Purposes for collection:** To provide and improve the AuthorLoft service, process transactions, send account communications, and ensure platform security.

**Categories of third parties with whom data is shared:**
- Stripe (payment processing)
- Supabase (database hosting)
- Vercel (application hosting)
- Resend (transactional email)
- PostHog (product analytics — anonymised where possible)
- Sentry (error monitoring)

**Do Not Sell or Share My Personal Information:** We do not sell or share personal information as defined under CCPA/CPRA. No opt-out mechanism is required, but you are welcome to contact us to confirm.

**Sensitive Personal Information:** We do not collect or use sensitive personal information as defined under CPRA beyond what is necessary to provide the service.

**Data Retention:** We retain personal information for as long as your account is active, plus any period required by applicable law. See our Privacy Policy for full retention details.

**Shine the Light:** California Civil Code Section 1798.83 permits users who are California residents to request certain information regarding disclosure of personal information to third parties for their direct marketing purposes. We do not disclose personal information to third parties for their direct marketing purposes.`,
  },
  {
    heading: "How to Submit a Privacy Request",
    body: `To exercise any of the rights described on this page:

**Email:** hello@authorloft.com
**Subject line:** "US Privacy Rights Request"
**Or use:** https://www.authorloft.com/contact

Please include your name and the email address associated with your AuthorLoft account (or the author site you subscribed to), and specify which right(s) you wish to exercise.

We will acknowledge your request within 10 business days and respond substantively within 45 days (or within the timeframe required by your state's law, whichever is shorter). If we need additional time we will notify you before the initial period expires.

We may need to verify your identity before fulfilling a request. We will never use this verification process to collect more data than necessary.

**Authorised agents:** If you are submitting a request on behalf of another person (e.g. as a parent or legal guardian), please indicate this in your request and provide documentation of your authorisation.`,
  },
  {
    heading: "Third-Party Data Processors",
    body: `AuthorLoft uses the following service providers to operate the platform. Each receives only the data necessary to perform their function and is contractually required to protect it:

**Stripe** — payment processing. PCI DSS Level 1 certified. https://stripe.com/privacy

**Supabase** — database hosting. SOC 2 Type II certified. https://supabase.com/privacy

**Vercel** — application and CDN hosting. https://vercel.com/legal/privacy-policy

**Resend** — transactional email (account verification, order confirmations). https://resend.com/privacy

**PostHog** — product analytics (page views, feature usage). Data anonymised where possible. https://posthog.com/privacy

**Sentry** — error monitoring and crash reporting. https://sentry.io/privacy/

**Google (Gemini API)** — AI features (author-facing tools only; no reader data sent). https://policies.google.com/privacy`,
  },
  {
    heading: "Children's Privacy",
    body: `AuthorLoft is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately at hello@authorloft.com and we will delete it promptly.`,
  },
  {
    heading: "Changes to This Page",
    body: `We will update this page as U.S. state privacy laws evolve or our practices change. Material changes will be communicated via email or a notice on the platform. The "Last updated" date at the top of this page reflects the most recent revision.

For questions not answered here, contact us at hello@authorloft.com or via our contact page.`,
  },
];

function renderBody(body: string) {
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map((para, i) => {
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
  });
}

export default function UsPrivacyPage() {
  const updatedAt = new Date("2026-06-16").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#E8E5DD]">
      {/* Nav */}
      <header className="border-b border-[#DCDBD3] bg-[#E8E5DD] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 260 38" width={200} height={34} aria-label="AuthorLoft" role="img">
              <text x="0" y="30" style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
                <tspan fill="#B8893D">Author</tspan><tspan fill="#1B2B47">Loft</tspan>
              </text>
            </svg>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AuthorLoft home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1B2B47]">U.S. State Privacy Rights</h1>
          <p className="text-sm text-[#8993A4] mt-2">Last updated: {updatedAt}</p>
          <p className="text-[#5C6E89] mt-4 leading-relaxed">
            Your privacy matters to us. This page explains the rights U.S. residents have over
            their personal data under California, Virginia, Colorado, and other state privacy laws,
            and how to exercise those rights with AuthorLoft.
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className="text-lg font-bold text-[#1B2B47] mb-3">{heading}</h2>
              <div className="space-y-3">
                {renderBody(body)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#DCDBD3] flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Privacy Policy →</Link>
          <Link href="/gdpr"    className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">GDPR &amp; Data Rights →</Link>
          <Link href="/terms"   className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Terms of Service →</Link>
          <Link href="/contact" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Contact us</Link>
        </div>

        {/* Register CTA */}
        <div className="mt-8 rounded-xl bg-[#F0EDE4] border border-[#DCDBD3] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5C6E89]">Ready to own your author business?</p>
          <Link href="/register" className="flex-shrink-0 bg-[#B8893D] text-[#0F1A2D] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#D4AE6A] transition-colors">
            Create your free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
