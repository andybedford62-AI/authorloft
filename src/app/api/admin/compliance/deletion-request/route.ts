import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason } = await req.json();

  const [author, settings] = await Promise.all([
    prisma.author.findUnique({
      where: { id: authorId },
      select: { email: true, name: true, slug: true },
    }),
    prisma.platformSettings.findUnique({
      where: { id: "singleton" },
      select: { contactEmail: true },
    }),
  ]);

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fall back to first super admin if no platform contact email is set
  let adminEmail = settings?.contactEmail;
  if (!adminEmail) {
    const superAdmin = await prisma.author.findFirst({
      where: { isSuperAdmin: true },
      select: { email: true },
    });
    adminEmail = superAdmin?.email;
  }

  if (adminEmail) {
    await sendMail({
      to:      adminEmail,
      subject: `Account Deletion Request — ${author.name} (${author.slug})`,
      html:    `
        <p>An author has requested deletion of their account.</p>
        <ul>
          <li><strong>Name:</strong> ${author.name}</li>
          <li><strong>Email:</strong> ${author.email}</li>
          <li><strong>Slug:</strong> ${author.slug}</li>
          <li><strong>Reason:</strong> ${reason?.trim() || "Not provided"}</li>
          <li><strong>Requested at:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p>Please review and process this request within 30 days in accordance with GDPR/CCPA requirements.</p>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
