import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SocialPromoteSettingsForm } from "@/components/super-admin/social-promote-settings-form";

export default async function SocialPromoteSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");

  const settings = await prisma.socialPromoteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Promote — Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform-wide controls for the AI social post generator. The kill switch here is the primary safety
          control. An env-level kill switch (<code className="bg-gray-100 px-1 rounded">SOCIAL_PROMOTE_KILL_SWITCH</code>)
          also exists for emergencies and takes precedence over this toggle.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SocialPromoteSettingsForm initial={settings} />
      </div>
    </div>
  );
}
