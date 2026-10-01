import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// Rules for the State of Indie Authors 2026 survey prize draw. Dates, prize and
// process come from docs/STATE_OF_INDIE_AUTHORS_2026_TALLY_SPEC.md. If the
// survey dates or prize change, change both. Noindex on purpose: this is a
// reference page for entrants, not something to rank.
export const metadata: Metadata = {
  title: "State of Indie Authors 2026: Prize Draw Rules",
  description: "Official rules for the State of Indie Authors 2026 survey prize draw run by AuthorLoft. No purchase necessary.",
  alternates: { canonical: "/research/state-of-indie-authors-2026/rules" },
  robots: { index: false, follow: true },
};

const SURVEY_URL = "https://tally.so/r/2EQ1qj";

// Sponsor details match the DMCA page (src/app/(marketing)/dmca/page.tsx).
const SPONSOR = {
  company: "Anthony P Bedford LLC",
  brand:   "AuthorLoft",
  street:  "713 Fish Camp Rd.",
  city:    "Chelsea, AL 35043",
};

const SECTIONS = [
  {
    heading: "No Purchase Necessary",
    body: `No purchase or payment of any kind is necessary to enter or to win. Taking the survey is free. Buying or not buying anything from AuthorLoft has no effect on your chance of winning.`,
  },
  {
    heading: "Sponsor",
    body: `The State of Indie Authors 2026 survey and prize draw are run by ${SPONSOR.brand}, operated by ${SPONSOR.company}, ${SPONSOR.street}, ${SPONSOR.city} (the "Sponsor"). The survey is not sponsored, endorsed or administered by Tally, LinkedIn, Facebook, Reddit, or any other platform where it may be shared.`,
  },
  {
    heading: "Entry Period",
    body: `The survey opens on **October 5, 2026** and closes on **November 1, 2026 at 11:59 PM Eastern Time**. Entries submitted outside this period are not eligible.`,
  },
  {
    heading: "Who Can Enter",
    body: `You can enter the prize draw if you are **18 or older**, **a resident of the United States**, and an author who self-publishes, including authors who both self-publish and publish traditionally. The survey screens out authors who publish only through a traditional publisher.

Current paid AuthorLoft subscribers, and employees of the Sponsor and their immediate family, are not eligible for the prize.

The survey is open to authors anywhere. If you are outside the United States you are welcome to take part and your answers count in the results, but you cannot win a prize.`,
  },
  {
    heading: "How to Enter",
    body: `Complete the survey at ${SURVEY_URL}. On the final page, enter your first name and email address to be entered in the draw. Your name and email are optional: if you leave them blank, your answers still count in the results, but you are not entered in the draw and you will not receive the report.

There is a limit of **one entry per person**. Entries are matched by email address, and duplicate entries are removed. Entries made by automated means, or submitted by someone other than the person named, are not eligible.`,
  },
  {
    heading: "Prizes",
    body: `Three (3) winners will each receive **one year of the AuthorLoft Standard plan**, at no charge. The approximate retail value of each prize is **$99.99**, based on the current annual price of the plan.

The prize is applied to a free AuthorLoft account registered with the email address used to enter. If you do not have an account, you can create one at no cost. The prize has no cash value, cannot be exchanged for cash or another plan, and cannot be transferred.`,
  },
  {
    heading: "The Draw and How Winners Are Chosen",
    body: `The Sponsor will draw three winners at random from all eligible entries on **November 30, 2026**. Your chance of winning depends on the number of eligible entries received.

Winners are announced and notified by email on **December 1, 2026**, at the address they entered. A winner must reply and register their account within **14 days** of the notice. If a winner does not respond in that time, or is found to be ineligible, the Sponsor will draw another winner.`,
  },
  {
    heading: "Taxes",
    body: `Winners are responsible for any taxes that apply to receiving a prize.`,
  },
  {
    heading: "Your Information",
    body: `Your name and email address are used only to run the draw, to send you the report if you ask for it, and for any follow-up you tick on the final page. They are kept separate from your survey answers when the results are analyzed. Survey answers are only ever published in aggregate and are never tied to your name. See our [Privacy Policy](/privacy) for how AuthorLoft handles personal data.`,
  },
  {
    heading: "General Conditions",
    body: `The Sponsor may disqualify any entry it reasonably believes is fraudulent, duplicated, automated, or in breach of these rules. If the draw cannot run as planned because of fraud, a technical failure, or another cause outside the Sponsor's control, the Sponsor may change or cancel it and will post any change on this page.

The Sponsor is not responsible for entries that are lost, late, incomplete, or not received because of technical problems. Void where prohibited by law.`,
  },
  {
    heading: "Questions",
    body: `If you have a question about these rules or the draw, contact us at https://www.authorloft.com/contact.`,
  },
];

export default function SurveyRulesPage() {
  const updatedAt = new Date("2026-10-01T12:00:00Z").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
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
          <h1 className="text-3xl font-bold text-[#1B2B47]">State of Indie Authors 2026: Prize Draw Rules</h1>
          <p className="text-sm text-[#8993A4] mt-2">Last updated: {updatedAt}</p>
          <p className="text-[#5C6E89] mt-4 leading-relaxed">
            These are the official rules for the prize draw that goes with the State of Indie Authors 2026
            survey. No purchase is necessary to enter or win.
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
                    const parts = para.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
                    return (
                      <p key={i} className="text-[#5C6E89] leading-relaxed">
                        {parts.map((part, j) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={j} className="text-[#1B2B47]">{part.replace(/\*\*/g, "")}</strong>;
                          }
                          const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                          if (link) {
                            return <Link key={j} href={link[2]} className="text-[#C26A4A] hover:text-[#1B2B47] underline">{link[1]}</Link>;
                          }
                          return part;
                        })}
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
      </div>
    </div>
  );
}
