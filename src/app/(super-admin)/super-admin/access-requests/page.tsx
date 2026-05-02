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
      <h1 className="text-2xl font-bold text-white mb-6">Access & Beta</h1>
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
