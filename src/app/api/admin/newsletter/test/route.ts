import { NextRequest, NextResponse } from "next/server";
import { canUseFeature } from "@/lib/plan-limits";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { sendTestNewsletter } from "@/lib/newsletter-send";

// POST /api/admin/newsletter/test — emails one "[TEST]" copy to the author's own
// login address. Creates no Campaign row and no send logs.
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const limited = await enforceRateLimit(req, {
    bucket: "newsletter-test", userId: authorId, maxRequests: 10, windowSeconds: 3600,
  });
  if (limited) return limited;

  const { subject, htmlBody, categoryFilter, includeBooks, includeReview, specialId } = await req.json();
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Email body cannot be empty." }, { status: 400 });
  }

  const result = await sendTestNewsletter(authorId, {
    subject,
    htmlBody,
    categoryFilter: Array.isArray(categoryFilter) ? categoryFilter : [],
    includeBooks:   !!includeBooks,
    includeReview:  !!includeReview,
    specialId:      specialId || null,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, to: result.to });
}
