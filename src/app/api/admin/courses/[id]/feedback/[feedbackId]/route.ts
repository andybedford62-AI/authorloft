import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import type { BookFeedbackStatus } from "@prisma/client";

// Mirrors /api/admin/books/[id]/feedback/[feedbackId] exactly, for courses.

// PATCH /api/admin/courses/[id]/feedback/[feedbackId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> },
) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId, feedbackId } = await params;

  const existing = await prisma.courseFeedback.findFirst({
    where: { id: feedbackId, course: { id: courseId, authorId: uid } },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { status } = await req.json();
  const valid: BookFeedbackStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.courseFeedback.update({
    where: { id: feedbackId },
    data: { status },
  });

  return NextResponse.json({ feedback: updated });
}

// DELETE /api/admin/courses/[id]/feedback/[feedbackId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> },
) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId, feedbackId } = await params;

  const existing = await prisma.courseFeedback.findFirst({
    where: { id: feedbackId, course: { id: courseId, authorId: uid } },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.courseFeedback.delete({ where: { id: feedbackId } });
  return NextResponse.json({ ok: true });
}
