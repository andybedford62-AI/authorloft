import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AiAssistantShell } from "./ai-assistant-shell";

export default async function AiAssistantPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: {
      plan:          { select: { tier: true } },
      aiApiKey:      true,
      aiUsageCount:  true,
      aiUsageCap:    true,
      aiUsageResetAt: true,
    },
  });

  const tier = author?.plan?.tier ?? "FREE";
  if (tier !== "PREMIUM") redirect("/admin/dashboard");

  const hasOwnKey  = !!author?.aiApiKey;
  const usageCount = author?.aiUsageCount ?? 0;
  const usageCap   = author?.aiUsageCap   ?? 20;
  const atLimit    = !hasOwnKey && usageCount >= usageCap;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your AI-powered writing toolkit — drafts, blogs, marketing copy, and reader insights.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
          Powered by Gemini
        </span>
      </div>

      <AiAssistantShell
        hasOwnKey={hasOwnKey}
        usageCount={usageCount}
        usageCap={usageCap}
        atLimit={atLimit}
      />
    </div>
  );
}
