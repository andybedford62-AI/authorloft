import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sanitize } from "@/lib/sanitize";

const MAX_TEMPLATES = 30;

// POST /api/admin/newsletter/templates — save the composer's current content as a template.
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const { name, subject, htmlBody, includeBooks, includeReview } = await req.json();
  const cleanName = String(name ?? "").trim().slice(0, 80);
  if (!cleanName) return NextResponse.json({ error: "Give the template a name." }, { status: 400 });
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Write something in the body first." }, { status: 400 });
  }

  if ((await prisma.newsletterTemplate.count({ where: { authorId } })) >= MAX_TEMPLATES) {
    return NextResponse.json({ error: `You can keep up to ${MAX_TEMPLATES} templates. Delete one first.` }, { status: 400 });
  }

  const tpl = await prisma.newsletterTemplate.create({
    data: {
      authorId,
      name:          cleanName,
      subject:       String(subject ?? "").slice(0, 300),
      body:          sanitize(String(htmlBody)),
      includeBooks:  !!includeBooks,
      includeReview: !!includeReview,
    },
    select: { id: true, name: true, subject: true, body: true, includeBooks: true, includeReview: true },
  });
  return NextResponse.json(tpl);
}
