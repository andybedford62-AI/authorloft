import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorId = (session.user as any).id as string;
  const body = await req.json();
  const { currentPassword, newPassword } = body;

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // Fetch the author to verify current password
  const author = await prisma.author.findUnique({ where: { id: authorId } });
  if (!author || !author.passwordHash) {
    return NextResponse.json(
      { error: "Password change is not available for this account type." },
      { status: 400 }
    );
  }

  const isCorrect = await bcrypt.compare(currentPassword, author.passwordHash);
  if (!isCorrect) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from your current password." },
      { status: 400 }
    );
  }

  // Hash and save the new password
  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.author.update({
    where: { id: authorId },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ ok: true });
}
