import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const body = await req.json();

  const {
    displayName, tagline, shortBio, bio,
    profileImageUrl,
    linkedinUrl, youtubeUrl, facebookUrl, twitterUrl, instagramUrl,
    contactEmail, heroTitle, heroSubtitle, showHeroBanner,
    aboutStats, credentials,
  } = body;

  const author = await prisma.author.update({
    where: { id: authorId },
    data: {
      displayName:    displayName    ?? null,
      tagline:        tagline        ?? null,
      shortBio:       shortBio       ?? null,
      bio:            bio            ?? null,
      // Only update profileImageUrl if explicitly provided (allows clearing with "")
      ...(profileImageUrl !== undefined && {
        profileImageUrl: profileImageUrl || null,
      }),
      linkedinUrl:    linkedinUrl    || null,
      youtubeUrl:     youtubeUrl     || null,
      facebookUrl:    facebookUrl    || null,
      twitterUrl:     twitterUrl     || null,
      instagramUrl:   instagramUrl   || null,
      contactEmail:   contactEmail   || null,
      heroTitle:      heroTitle      || null,
      heroSubtitle:   heroSubtitle   || null,
      ...(typeof showHeroBanner === "boolean" && { showHeroBanner }),
      ...(Array.isArray(aboutStats) && { aboutStats }),
      ...(Array.isArray(credentials) && { credentials: credentials.slice(0, 3) }),
    },
    select: { id: true, displayName: true, profileImageUrl: true },
  });

  return NextResponse.json(author);
}
