import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { LegalNoticeForm } from "@/components/admin/legal-notice-form";

export const metadata = { title: "Legal Notice" };

const DEFAULT_LEGAL_NOTICE = `**Legal Notice & Disclaimer**

The content on this website is provided for informational purposes only. All book descriptions, excerpts, and materials are the intellectual property of ${"{authorName}"} unless otherwise stated.

**Copyright**

All content on this site — including text, images, and downloadable materials — is protected by copyright law. Reproduction or distribution without prior written permission is prohibited.

**Affiliate & Purchase Links**

Some links on this site may be affiliate links or links to third-party retailers. Purchases made through these links may earn the author a commission at no additional cost to you.

**Digital Sales**

Digital products (eBooks, etc.) sold through this site are for personal use only and may not be redistributed, resold, or shared. All sales are final unless otherwise stated.

**External Links**

This site may contain links to external websites. The author is not responsible for the content or privacy practices of those sites.

**Privacy**

This site may use cookies to improve your experience. By continuing to use this site, you consent to the use of cookies. No personal data is sold to third parties.

**Contact**

For any legal enquiries, please use the contact form on this website.`;

export default async function AdminLegalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      name: true,
      legalNotice: true,
      legalNoticeUpdatedAt: true,
    },
  });

  if (!author) redirect("/login");

  // Personalise the default template with the author's name
  const defaultContent = DEFAULT_LEGAL_NOTICE.replace(
    /\$\{authorName\}/g,
    author.name
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal Notice</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a legal notice, disclaimer, or copyright statement for your author
          website. This will be displayed on a dedicated page linked from your
          site footer. A default template has been provided — edit it to match
          your needs.
        </p>
      </div>

      <LegalNoticeForm
        initialContent={author.legalNotice ?? defaultContent}
        updatedAt={author.legalNoticeUpdatedAt?.toISOString() ?? null}
      />
    </div>
  );
}
