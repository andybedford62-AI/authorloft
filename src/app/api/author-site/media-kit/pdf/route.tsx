import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { getMediaKitData } from "@/lib/media-kit-data";
import { MediaKitPdf } from "@/lib/media-kit-pdf";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const author = await prisma.author.findFirst({
    where: { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
    select: { id: true, slug: true, plan: { select: { mediaKitEnabled: true } } },
  });
  if (!author?.plan?.mediaKitEnabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await getMediaKitData(author.id);
  const buffer = await renderToBuffer(<MediaKitPdf data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${author.slug}-media-kit.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
