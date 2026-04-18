import { prisma } from "@/lib/db";
import { FeatureConfigForm } from "@/components/super-admin/feature-config-form";

export default async function FeatureConfigPage() {
  const config = await prisma.planFeatureConfig.findUnique({ where: { id: "singleton" } });
  const initialGates = (config?.gates as Record<string, string>) ?? {};

  return <FeatureConfigForm initialGates={initialGates} />;
}
