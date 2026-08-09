import { prisma } from "@/lib/db";
import { AccessRequestsClient } from "./AccessRequestsClient";

export default async function AccessRequestsPage() {
  const [requests, systemConfig, betaCodes] = await Promise.all([
    prisma.accessRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.systemConfig.upsert({
      where:  { id: "main" },
      create: { id: "main", maintenanceMode: false, maintenanceMessage: "" },
      update: {},
    }),
    prisma.inviteCode.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Access &amp; Beta</h1>
        <p className="text-sm text-gray-500 mt-1">Manage access requests and beta invite codes.</p>
      </div>
      <AccessRequestsClient
        requests={requests.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
        betaMode={systemConfig.betaMode}
        betaMessage={systemConfig.betaMessage}
        betaCodes={betaCodes.map((c) => ({
          ...c,
          expiresAt: c.expiresAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
