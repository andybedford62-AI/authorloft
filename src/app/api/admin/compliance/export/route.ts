import { NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      id:           true,
      email:        true,
      name:         true,
      displayName:  true,
      slug:         true,
      bio:          true,
      shortBio:     true,
      tagline:      true,
      contactEmail: true,
      linkedinUrl:  true,
      twitterUrl:   true,
      instagramUrl: true,
      facebookUrl:  true,
      youtubeUrl:   true,
      createdAt:    true,
      plan:         { select: { name: true, tier: true } },
    },
  });

  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [books, orders, subscriberCount, posts, pages] = await Promise.all([
    prisma.book.findMany({
      where: { authorId },
      select: {
        id: true, title: true, subtitle: true, publishStatus: true,
        priceCents: true, createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { authorId, status: "COMPLETED" },
      select: {
        id: true, customerEmail: true, customerName: true,
        totalCents: true, discountCents: true, createdAt: true,
        items: { select: { book: { select: { title: true } }, priceCents: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscriber.count({ where: { authorId } }),
    prisma.post.findMany({
      where: { authorId },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.authorPage.findMany({
      where: { authorId },
      select: { id: true, title: true, slug: true, createdAt: true },
    }),
  ]);

  const payload = {
    exportedAt:  new Date().toISOString(),
    exportNote:  "This export contains all personal and account data stored by AuthorLoft for your account.",
    profile:     author,
    books,
    orders,
    subscriberCount,
    posts,
    customPages: pages,
  };

  const filename = `authorloft-data-export-${new Date().toISOString().split("T")[0]}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type":        "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
