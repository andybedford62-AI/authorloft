import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

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
