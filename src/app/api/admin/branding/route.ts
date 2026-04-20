import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const {
    displayName, tagline, shortBio, bio,
    profileImageUrl, logoUrl,
    linkedinUrl, youtubeUrl, facebookUrl, twitterUrl, instagramUrl,
    contactEmail, contactResponseTime, contactOpenTo,
    heroTitle, heroSubtitle, showHeroBanner,
    aboutStats, credentials,
  } = body;

  const author = await prisma.author.update({
    where: { id: authorId },
    data: {
      displayName:    displayName    ?? null,
      tagline:        tagline        ?? null,
      shortBio:       shortBio       ?? null,
      bio:            bio            ?? null,
      ...(profileImageUrl !== undefined && {
        profileImageUrl: profileImageUrl || null,
      }),
      ...(logoUrl !== undefined && {
        logoUrl: logoUrl || null,
      }),
      linkedinUrl:    linkedinUrl    || null,
      youtubeUrl:     youtubeUrl     || null,
      facebookUrl:    facebookUrl    || null,
      twitterUrl:     twitterUrl     || null,
      instagramUrl:   instagramUrl   || null,
      contactEmail:         contactEmail         || null,
      contactResponseTime:  contactResponseTime  || null,
      contactOpenTo:        contactOpenTo        || null,
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
