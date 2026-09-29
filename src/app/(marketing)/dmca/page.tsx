import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright & DMCA Policy",
  description: "How to report copyright infringement on AuthorLoft, how to file a counter-notice, and our repeat-infringer policy.",
  alternates: { canonical: "/dmca" },
  openGraph: { type: "website", title: "Copyright & DMCA Policy | AuthorLoft", description: "How to report copyright infringement on AuthorLoft and how counter-notices work." },
  twitter:    { card: "summary",  title: "Copyright & DMCA Policy | AuthorLoft", description: "How to report copyright infringement on AuthorLoft and how counter-notices work." },
};

// Matches the U.S. Copyright Office DMCA Designated Agent Directory listing
// (registration DMCA-1081407, effective Sept 29, 2026). If either changes,
// the directory entry must be amended too.
const AGENT = {
  name:    "Anthony Bedford",
  company: "Anthony P Bedford LLC",
  street:  "713 Fish Camp Rd.",
  city:    "Chelsea, AL 35043",
  phone:   "770-329-2791",
  email:   "dmca@authorloft.com",
};

const SECTIONS = [
  {
    heading: "Our Policy",
    body: `AuthorLoft respects the intellectual property rights of others and expects authors who use the platform to do the same. Authors upload and publish their own content, such as cover images, profile photos, descriptions, blog posts, course material and downloadable files. We respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (17 U.S.C. § 512).

Music lists on AuthorLoft are collections of links to third-party services. AuthorLoft does not host the audio itself. Book listings link to retailers and author sites.`,
  },
  {
    heading: "Reporting Copyright Infringement",
    body: `If you believe content on AuthorLoft infringes your copyright, send a written notice to our designated agent (details below) that includes all of the following:

- Your physical or electronic signature.
- Identification of the copyrighted work you claim has been infringed.
- Identification of the material you claim is infringing, with enough detail for us to find it, such as the URL of the page.
- Your name, mailing address, telephone number and email address.
- A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law.
- A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or are authorized to act on the owner's behalf.

Please be aware that knowingly misrepresenting that material is infringing may make you liable for damages, including costs and attorneys' fees (17 U.S.C. § 512(f)).`,
  },
  {
    heading: "What Happens After a Notice",
    body: `When we receive a valid notice we will act promptly to remove or disable access to the identified material and will notify the author who published it, including a copy of the notice. Notices may be shared with the author and, where required, forwarded to the person who submitted a counter-notice.`,
  },
  {
    heading: "Counter-Notice",
    body: `If you are an author whose content was removed and you believe the removal was a mistake or that you have the right to use the material, you may send a counter-notice to our designated agent that includes:

- Your physical or electronic signature.
- Identification of the material that was removed and where it appeared before removal.
- A statement, made under penalty of perjury, that you have a good-faith belief the material was removed as a result of mistake or misidentification.
- Your name, address and telephone number, and a statement that you consent to the jurisdiction of the federal district court for the judicial district where your address is located (or, if outside the United States, any judicial district in which AuthorLoft may be found), and that you will accept service of process from the person who submitted the original notice.

If we receive a valid counter-notice we will forward it to the original complainant. Unless that person notifies us within 10 business days that they have filed a court action seeking to restrain the alleged infringement, we may restore the material within 10 to 14 business days after receiving the counter-notice.`,
  },
  {
    heading: "Repeat Infringers",
    body: `AuthorLoft will terminate, in appropriate circumstances, the accounts of authors who are repeat infringers. As a guide, an account that is the subject of multiple valid infringement notices that are not successfully countered may be suspended or permanently terminated.`,
  },
];

export default function DmcaPage() {
  const updatedAt = new Date("2026-09-29T12:00:00Z").toLocaleDateString("en-US", {
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
          <h1 className="text-3xl font-bold text-[#1B2B47]">Copyright &amp; DMCA Policy</h1>
          <p className="text-sm text-[#8993A4] mt-2">Last updated: {updatedAt}</p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map(({ heading, body }) => {
            // Blank-line separated blocks; a block whose lines all start with "- " is a list.
            const blocks = body.split(/\n\n+/);
            return (
              <div key={heading}>
                <h2 className="text-lg font-bold text-[#1B2B47] mb-3">{heading}</h2>
                <div className="space-y-3">
                  {blocks.map((block, i) => {
                    const lines = block.split("\n");
                    if (lines.every((l) => l.startsWith("- "))) {
                      return (
                        <ul key={i} className="list-disc pl-6 space-y-2 text-[#5C6E89] leading-relaxed">
                          {lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}
                        </ul>
                      );
                    }
                    return <p key={i} className="text-[#5C6E89] leading-relaxed">{block}</p>;
                  })}
                </div>
              </div>
            );
          })}

          <div>
            <h2 className="text-lg font-bold text-[#1B2B47] mb-3">Designated Agent</h2>
            <p className="text-[#5C6E89] leading-relaxed mb-3">
              Send infringement notices and counter-notices to our designated agent, registered with the
              U.S. Copyright Office:
            </p>
            <address className="not-italic rounded-xl bg-[#F0EDE4] border border-[#DCDBD3] px-6 py-5 text-[#5C6E89] leading-relaxed">
              <strong className="text-[#1B2B47]">{AGENT.name}</strong><br />
              {AGENT.company}<br />
              {AGENT.street}<br />
              {AGENT.city}<br />
              Phone: <a href={`tel:${AGENT.phone.replace(/-/g, "")}`} className="text-[#C26A4A] hover:text-[#1B2B47]">{AGENT.phone}</a><br />
              Email: <a href={`mailto:${AGENT.email}`} className="text-[#C26A4A] hover:text-[#1B2B47]">{AGENT.email}</a>
            </address>
            <p className="text-sm text-[#8993A4] mt-3">
              This contact is for copyright notices only. For anything else, please use our{" "}
              <Link href="/contact" className="text-[#C26A4A] hover:text-[#1B2B47]">contact page</Link>.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#DCDBD3] flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
          <Link href="/terms"   className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Terms of Service →</Link>
          <Link href="/privacy" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Privacy Policy →</Link>
          <Link href="/contact" className="text-[#C26A4A] hover:text-[#1B2B47] transition-colors">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
