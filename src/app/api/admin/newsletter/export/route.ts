import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  const [subscribers, genres] = await Promise.all([
    prisma.subscriber.findMany({
      where: { authorId },
      orderBy: { subscribedAt: "desc" },
    }),
    prisma.genre.findMany({
      where: { authorId },
      select: { id: true, name: true },
    }),
  ]);

  // Build genre lookup map
  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  // Build CSV
  const header = ["Name", "Email", "Interests", "Confirmed", "Subscribed At"];
  const rows = subscribers.map((s) => {
    const interests = s.categoryPrefs
      .map((id) => genreMap.get(id) ?? id)
      .join("; ");
    return [
      s.name ?? "",
      s.email,
      interests,
      s.isConfirmed ? "Yes" : "No",
      s.subscribedAt.toISOString().split("T")[0],
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  const csv = [header.join(","), ...rows].join("\r\n");
  const filename = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
