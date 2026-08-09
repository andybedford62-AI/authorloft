import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { getMediaKitData } from "@/lib/media-kit-data";
import { MediaKitPdf } from "@/lib/media-kit-pdf";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { slug: true, plan: { select: { mediaKitEnabled: true } } },
  });
  if (!author?.plan?.mediaKitEnabled) {
    return NextResponse.json({ error: "Media Kit requires a Standard plan or higher." }, { status: 403 });
  }

  const data = await getMediaKitData(authorId);
  const buffer = await renderToBuffer(<MediaKitPdf data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${author.slug}-media-kit.pdf"`,
      "Cache-Control": "private, max-age=0, no-cache",
    },
  });
}
