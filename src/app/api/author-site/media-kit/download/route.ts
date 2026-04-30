import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url      = searchParams.get("url");
  const filename = searchParams.get("filename") || "download.jpg";

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Only proxy URLs from our own Supabase storage
  const allowed = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (allowed && !url.startsWith(allowed)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":        contentType,
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control":       "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
