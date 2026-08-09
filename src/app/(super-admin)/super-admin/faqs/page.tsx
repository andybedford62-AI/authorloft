import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FaqsPanel } from "@/components/super-admin/faqs-panel";

export default async function SuperAdminFaqsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const faqs = await prisma.homepageFaq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FAQ Manager</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage FAQs shown on authorloft.com/faq. Active FAQs appear grouped by category. Use the arrows to reorder within the list.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FaqsPanel initialFaqs={faqs} />
      </div>
    </div>
  );
}
