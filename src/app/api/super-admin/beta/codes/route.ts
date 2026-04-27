import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase());
  return allowed.includes(session.user.email.toLowerCase());
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  const part  = Array.from(randomBytes(4)).map((b) => chars[b % chars.length]).join("");
  return `LOFT-${part}`;
}

// GET — list all codes
export async function GET() {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const codes = await prisma.inviteCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
}

// POST — generate one or more codes
export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body    = await req.json();
  const count   = Math.min(Math.max(Number(body.count)   || 1, 1), 50);
  const maxUses = Math.min(Math.max(Number(body.maxUses) || 1, 1), 1000);
  const label   = (body.label ?? "").slice(0, 100);
  const expiresAt: Date | null = body.expiresAt ? new Date(body.expiresAt) : null;

  // Generate unique codes, retrying on the rare collision
  const created = [];
  for (let i = 0; i < count; i++) {
    let code = generateCode();
    let attempts = 0;
    while (await prisma.inviteCode.findUnique({ where: { code }, select: { id: true } })) {
      code = generateCode();
      if (++attempts > 10) return NextResponse.json({ error: "Failed to generate unique code." }, { status: 500 });
    }
    const record = await prisma.inviteCode.create({
      data: { code, label, maxUses, expiresAt },
    });
    created.push(record);
  }

  return NextResponse.json(created, { status: 201 });
}
