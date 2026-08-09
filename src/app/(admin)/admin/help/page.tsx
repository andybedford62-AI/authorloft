import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { Headphones } from "lucide-react";
import { ContactSupportForm } from "@/components/admin/contact-support-form";
import { HelpSupportTabs } from "./help-support-tabs";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const authorId = await getAdminAuthorId();

  const [author, supportEmails] = await Promise.all([
    prisma.author.findUnique({
      where: { id: authorId },
      select: { name: true, email: true },
    }),
    prisma.supportEmail.findMany({
      where: { isActive: true },
      select: { id: true, label: true, email: true, description: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const contact = supportEmails.length === 0 ? (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 max-w-2xl">
      <Headphones className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="font-medium">Support contact not yet configured.</p>
      <p className="text-sm mt-1">Please check back soon or browse the Help centre tab.</p>
    </div>
  ) : (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-4">
        Send a message to the AuthorLoft team. We typically respond within one business day.
      </p>
      <ContactSupportForm
        authorName={author?.name ?? ""}
        authorEmail={author?.email ?? ""}
        supportEmails={supportEmails}
      />
    </div>
  );

  return <HelpSupportTabs contact={contact} />;
}
