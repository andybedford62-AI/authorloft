import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

/** Returns true if the URL is safe to store: must be https and match an allowed domain. Empty string always passes. */
function isSafeUrl(url: string | undefined, allowedDomains: string[]): boolean {
  if (!url) return true;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    return allowedDomains.some(d => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const URL_RULES: { field: string; label: string; domains: string[] }[] = [
  { field: "linkedinUrl",  label: "LinkedIn",  domains: ["linkedin.com"] },
  { field: "youtubeUrl",   label: "YouTube",   domains: ["youtube.com", "youtu.be"] },
  { field: "facebookUrl",  label: "Facebook",  domains: ["facebook.com", "fb.com"] },
  { field: "twitterUrl",   label: "X / Twitter", domains: ["twitter.com", "x.com"] },
  { field: "instagramUrl", label: "Instagram", domains: ["instagram.com"] },
];

export async function PATCH(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const {
    displayName, tagline, shortBio, bio,
    profileImageUrl, logoUrl, heroImageUrl, heroLayout,
    linkedinUrl, youtubeUrl, facebookUrl, twitterUrl, instagramUrl,
    contactEmail, contactResponseTime, contactOpenTo,
    heroTitle, heroSubtitle, showHeroBanner, heroFeaturedBookId,
    aboutStats, credentials,
  } = body;

  // Validate social URLs before writing to DB
  for (const { field, label, domains } of URL_RULES) {
    if (!isSafeUrl(body[field], domains)) {
      return NextResponse.json(
        { error: `${label} URL must be a valid https:// link to ${domains[0]}.` },
        { status: 400 }
      );
    }
  }

  // Hero layout gate — author-left and author-right require a paid plan
  if (heroLayout && heroLayout !== "portrait") {
    const author = await prisma.author.findUnique({
      where:  { id: authorId },
      select: { plan: { select: { tier: true } } },
    });
    const tier = author?.plan?.tier ?? "FREE";
    if (tier === "FREE") {
      return NextResponse.json(
        { error: "Author Left and Author Right hero layouts require a Standard or Premium plan." },
        { status: 403 }
      );
    }
  }

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
      ...(heroImageUrl !== undefined && {
        heroImageUrl: heroImageUrl || null,
      }),
      ...(heroLayout && { heroLayout }),
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
      ...(heroFeaturedBookId !== undefined && {
        heroFeaturedBookId: heroFeaturedBookId || null,
      }),
      ...(Array.isArray(aboutStats) && { aboutStats }),
      ...(Array.isArray(credentials) && { credentials: credentials.slice(0, 3) }),
    },
    select: { id: true, displayName: true, profileImageUrl: true },
  });

  return NextResponse.json(author);
}
