import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEFAULT_PRIVACY, DEFAULT_TERMS } from "@/lib/legal-defaults";
import { LegalEditor } from "@/components/admin/legal-editor";

export default async function SuperAdminLegalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
    select: {
      privacyContent: true,
      privacyUpdatedAt: true,
      termsContent: true,
      termsUpdatedAt: true,
      contactEmail: true,
    },
  }).catch(() => null);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal &amp; Platform Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit your Privacy Policy, Terms of Service, and platform contact email.
          Saving a document stamps a new "Last Updated" date — visitors who have
          not acknowledged the new version will see a notification banner.
        </p>
      </div>

      <LegalEditor
        initialPrivacy={settings?.privacyContent ?? DEFAULT_PRIVACY}
        privacyUpdatedAt={settings?.privacyUpdatedAt?.toISOString() ?? null}
        initialTerms={settings?.termsContent ?? DEFAULT_TERMS}
        termsUpdatedAt={settings?.termsUpdatedAt?.toISOString() ?? null}
        initialContactEmail={settings?.contactEmail ?? ""}
      />
    </div>
  );
}
