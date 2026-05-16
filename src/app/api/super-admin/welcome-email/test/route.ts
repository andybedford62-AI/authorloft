import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, name, slug } = await req.json();

  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  await sendWelcomeEmail(
    email.trim(),
    name?.trim() || "Test Author",
    slug?.trim() || "test-author",
  );

  return NextResponse.json({ ok: true });
}
