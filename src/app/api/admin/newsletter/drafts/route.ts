import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sanitize } from "@/lib/sanitize";

const MAX_DRAFTS = 25;

// POST /api/admin/newsletter/drafts — create-or-update a draft (autosave).
// Body: { id?, subject, htmlBody, categoryFilter, includeBooks, includeReview, specialId }
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const { id, subject, htmlBody, categoryFilter, includeBooks, includeReview, specialId } = await req.json();

  const data = {
    subject:        String(subject ?? "").slice(0, 300),
    body:           sanitize(String(htmlBody ?? "")),
    categoryFilter: Array.isArray(categoryFilter) ? categoryFilter.map(String) : [],
    includeBooks:   !!includeBooks,
    includeReview:  !!includeReview,
    specialId:      specialId ? String(specialId) : null,
  };

  if (id) {
    const res = await prisma.newsletterDraft.updateMany({ where: { id: String(id), authorId }, data });
    if (res.count > 0) {
      const draft = await prisma.newsletterDraft.findUnique({ where: { id: String(id) }, select: { id: true, updatedAt: true } });
      return NextResponse.json({ id: draft!.id, updatedAt: draft!.updatedAt.toISOString() });
    }
    // Fall through: the draft was deleted elsewhere — recreate it.
  }

  if ((await prisma.newsletterDraft.count({ where: { authorId } })) >= MAX_DRAFTS) {
    return NextResponse.json({ error: `You can keep up to ${MAX_DRAFTS} drafts. Delete one to save another.` }, { status: 400 });
  }
  const draft = await prisma.newsletterDraft.create({
    data: { authorId, ...data },
    select: { id: true, updatedAt: true },
  });
  return NextResponse.json({ id: draft.id, updatedAt: draft.updatedAt.toISOString() });
}
