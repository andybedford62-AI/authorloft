import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { Headphones } from "lucide-react";
import { ContactSupportForm } from "@/components/admin/contact-support-form";

export default async function ContactSupportPage() {
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Headphones className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send a message to the AuthorLoft team. We typically respond within one business day.
          </p>
        </div>
      </div>

      {supportEmails.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <Headphones className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="font-medium">Support contact not yet configured.</p>
          <p className="text-sm mt-1">Please check back soon or refer to the Help Centre.</p>
        </div>
      ) : (
        <ContactSupportForm
          authorName={author?.name ?? ""}
          authorEmail={author?.email ?? ""}
          supportEmails={supportEmails}
        />
      )}
    </div>
  );
}
