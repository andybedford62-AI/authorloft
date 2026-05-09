import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { auditLog, getAuditContext } from "@/lib/audit-logger";
import { sendMail, wrapHtml, esc } from "@/lib/mailer";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; arcId: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId } = await params;

    // Verify ARC belongs to author
    const arc = await prisma.arcCopy.findFirst({
      where: {
        id: arcId,
        bookId,
        book: { authorId },
      },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    const readers = await prisma.arcReader.findMany({
      where: { arcCopyId: arcId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        tokenExpiresAt: true,
        invitedAt: true,
        downloadedAt: true,
        reviewedAt: true,
        reminderSentAt: true,
        downloads: {
          select: { fileId: true, downloadedAt: true },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({
      readers: readers.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        invitedAt: r.invitedAt?.toISOString() ?? null,
        tokenExpiresAt: r.tokenExpiresAt?.toISOString() ?? null,
        downloadedAt: r.downloadedAt?.toISOString() ?? null,
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        downloadCount: r.downloads.length,
      })),
    });
  } catch (err: any) {
    console.error("[arc-readers] GET error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch readers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; arcId: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId } = await params;
    const body = await req.json();
    const { email, name, tokenExpiresAt: customExpiry } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name required" }, { status: 400 });
    }

    // Verify ARC belongs to author
    const arc = await prisma.arcCopy.findFirst({
      where: {
        id: arcId,
        bookId,
        book: { authorId },
      },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    // Check if reader already exists
    const existing = await prisma.arcReader.findFirst({
      where: { arcCopyId: arcId, email },
    });

    if (existing) {
      return NextResponse.json({ error: "Reader already invited" }, { status: 400 });
    }

    // Look up author name for the email
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { name: true, slug: true },
    });

    // Create reader with token
    const reader = await prisma.arcReader.create({
      data: {
        arcCopyId: arcId,
        email,
        name,
        token: generateToken(),
        tokenExpiresAt: customExpiry ? new Date(customExpiry) : arc.expiresAt,
        invitedAt: new Date(),
      },
    });

    // Send invite email
    const book = await prisma.book.findUnique({ where: { id: bookId }, select: { title: true } });
    const baseUrl = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
    const downloadUrl = `${baseUrl}/arc/${reader.token}`;
    const expiryLine = arc.expiresAt
      ? `This link expires on <strong>${new Date(arc.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.`
      : "This link does not expire.";

    await sendMail({
      to: email,
      subject: `You're invited to read an advance copy of "${book?.title}"`,
      text: [
        `Hi ${name},`,
        `${author?.name ?? "An author"} has invited you to read an advance copy of "${book?.title}".`,
        arc.disclaimer ? arc.disclaimer : "",
        `Download your copy here: ${downloadUrl}`,
        arc.expiresAt ? `This link expires on ${new Date(arc.expiresAt).toLocaleDateString()}.` : "",
        `— ${author?.name ?? "AuthorLoft"}`,
      ].filter(Boolean).join("\n\n"),
      html: wrapHtml(`You're invited to read "${esc(book?.title ?? "")}"`, `
        <p style="margin:0 0 16px;">Hi ${esc(name)},</p>
        <p style="margin:0 0 16px;">
          <strong>${esc(author?.name ?? "An author")}</strong> has invited you to read an advance copy of
          <strong>"${esc(book?.title ?? "")}"</strong> before it's published.
        </p>
        ${arc.disclaimer ? `
        <div style="background:#f9fafb;border-left:3px solid #d1d5db;padding:12px 16px;margin:0 0 24px;font-size:13px;color:#6b7280;">
          ${esc(arc.disclaimer)}
        </div>` : ""}
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:8px 0 24px;">
              <a href="${downloadUrl}"
                 style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Download My ARC
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
          If the button doesn't work, paste this link into your browser:
        </p>
        <p style="margin:0 0 24px;font-size:13px;word-break:break-all;">
          <a href="${downloadUrl}" style="color:#2563eb;">${downloadUrl}</a>
        </p>
        <p style="margin:0;font-size:13px;color:#9ca3af;">${expiryLine}</p>
      `),
    });

    auditLog({
      userId: authorId,
      action: "Invite ARC reader",
      endpoint: `/api/admin/books/${bookId}/arc/${arcId}/readers`,
      method: "POST",
      statusCode: 200,
      ...getAuditContext(req),
      metadata: { bookId, arcId, readerEmail: email },
    });

    return NextResponse.json({
      reader: {
        id: reader.id,
        name: reader.name,
        email: reader.email,
        status: reader.status,
        token: reader.token,
      },
    });
  } catch (err: any) {
    console.error("[arc-readers] POST error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to invite reader" }, { status: 500 });
  }
}
