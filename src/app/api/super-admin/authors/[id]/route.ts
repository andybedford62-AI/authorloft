import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const caller = await prisma.author.findUnique({
    where: { id: (session.user as any).id },
    select: { isSuperAdmin: true },
  });
  return caller?.isSuperAdmin ? session : null;
}

// GET /api/super-admin/authors/[id] — fetch single author for edit form
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const author = await prisma.author.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      slug: true,
      customDomain: true,
      bio: true,
      shortBio: true,
      tagline: true,
      contactEmail: true,
      isActive: true,
      isSuperAdmin: true,
      planId: true,
      createdAt: true,
      updatedAt: true,
      plan: { select: { id: true, name: true, tier: true } },
      _count: {
        select: { books: true, subscribers: true, orders: true, posts: true },
      },
    },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(author);
}

// PATCH /api/super-admin/authors/[id] — toggle isActive (quick action from table)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { isActive } = await req.json();

  const author = await prisma.author.update({
    where: { id },
    data: {
      ...(typeof isActive === "boolean" && { isActive }),
    },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  return NextResponse.json(author);
}

// PUT /api/super-admin/authors/[id] — full author update from edit form
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const {
    name,
    displayName,
    email,
    slug,
    customDomain,
    bio,
    shortBio,
    tagline,
    contactEmail,
    isActive,
    isSuperAdmin,
    planId,
  } = body;

  // Prevent slug / email conflicts with other authors
  if (slug) {
    const conflict = await prisma.author.findFirst({
      where: { slug, NOT: { id } },
    });
    if (conflict) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }
  if (email) {
    const conflict = await prisma.author.findFirst({
      where: { email, NOT: { id } },
    });
    if (conflict) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const author = await prisma.author.update({
    where: { id },
    data: {
      ...(name          !== undefined && { name }),
      ...(displayName   !== undefined && { displayName: displayName || null }),
      ...(email         !== undefined && { email }),
      ...(slug          !== undefined && { slug }),
      ...(customDomain  !== undefined && { customDomain: customDomain || null }),
      ...(bio           !== undefined && { bio: bio || null }),
      ...(shortBio      !== undefined && { shortBio: shortBio || null }),
      ...(tagline       !== undefined && { tagline: tagline || null }),
      ...(contactEmail  !== undefined && { contactEmail: contactEmail || null }),
      ...(typeof isActive     === "boolean" && { isActive }),
      ...(typeof isSuperAdmin === "boolean" && { isSuperAdmin }),
      ...(planId !== undefined && { planId: planId || null }),
    },
    select: {
      id: true, name: true, slug: true, email: true,
      isActive: true, isSuperAdmin: true,
    },
  });

  return NextResponse.json(author);
}

// DELETE /api/super-admin/authors/[id] — permanently remove an author account
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Safety: prevent super admin from deleting themselves
  if ((session.user as any).id === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.author.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
