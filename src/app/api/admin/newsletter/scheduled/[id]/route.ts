import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// DELETE /api/admin/newsletter/scheduled/:id — cancel a scheduled send. The
// content is not lost: it is turned back into a draft.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const c = await prisma.campaign.findFirst({
    where: { id, authorId, status: "SCHEDULED" },
    select: { subject: true, body: true, categoryFilter: true, includeBooks: true, includeReview: true, specialId: true },
  });
  if (!c) {
    return NextResponse.json({ error: "That newsletter is no longer scheduled (it may already be sending)." }, { status: 409 });
  }

  // Claim by status so a send that starts at this instant can't also be cancelled.
  const claimed = await prisma.campaign.deleteMany({ where: { id, authorId, status: "SCHEDULED" } });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "That newsletter is already sending." }, { status: 409 });
  }

  const draft = await prisma.newsletterDraft.create({
    data: {
      authorId,
      subject:        c.subject,
      body:           c.body ?? "",
      categoryFilter: c.categoryFilter,
      includeBooks:   c.includeBooks,
      includeReview:  c.includeReview,
      specialId:      c.specialId,
    },
    select: { id: true, subject: true, updatedAt: true },
  });
  return NextResponse.json({ ok: true, draft: { id: draft.id, subject: draft.subject, updatedAt: draft.updatedAt.toISOString() } });
}
