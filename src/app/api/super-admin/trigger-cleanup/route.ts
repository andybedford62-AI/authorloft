import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isSuperAdmin(session: any) {
  return !!(session?.user as any)?.isSuperAdmin;
}

// POST /api/super-admin/trigger-cleanup
// Proxies the onboarding-cleanup cron server-side so the CRON_SECRET
// never has to be exposed as a NEXT_PUBLIC_ env var.
export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const secret  = process.env.CRON_SECRET ?? "";
  const baseUrl = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");

  const res  = await fetch(`${baseUrl}/api/cron/onboarding-cleanup`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
