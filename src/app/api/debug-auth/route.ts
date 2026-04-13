import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// TEMPORARY DEBUG ENDPOINT - remove after fixing login
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "andybedford62@gmail.com";
  const password = searchParams.get("password") || "";

  try {
    const author = await prisma.author.findUnique({
      where: { email },
      select: { email: true, passwordHash: true, isSuperAdmin: true },
    });

    if (!author) {
      return NextResponse.json({ ok: false, error: "Author not found" });
    }

    if (!author.passwordHash) {
      return NextResponse.json({ ok: false, error: "No password hash on account" });
    }

    const isValid = password
      ? await bcrypt.compare(password, author.passwordHash)
      : null;

    return NextResponse.json({
      ok: true,
      email: author.email,
      isSuperAdmin: author.isSuperAdmin,
      hasHash: true,
      hashPrefix: author.passwordHash.substring(0, 7),
      passwordValid: isValid,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
