import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";
import { slugify } from "./utils";
import bcrypt from "bcryptjs";
import { checkLoginRateLimit } from "./login-rate-limit";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "";
// vercel.app is on the Public Suffix List — browsers reject subdomain cookies for it.
// Only apply a custom cookie domain when using a real custom domain (e.g. authorloft.com).
const isPublicSuffixDomain = platformDomain.includes("vercel.app") || platformDomain.includes("localhost");
const useCustomCookieDomain = platformDomain && !isPublicSuffixDomain;

// Ensure slug is unique — appends a number if taken
async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let attempt = 2;
  while (await prisma.author.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}${attempt++}`;
  }
  return candidate;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // Set cookie domain to root platform domain so subdomains can read the session.
  // Skipped for vercel.app and localhost (Public Suffix List restriction).
  ...(useCustomCookieDomain && {
    cookies: {
      sessionToken: {
        name: `${useSecureCookies ? "__Secure-" : ""}next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: useSecureCookies,
          domain: `.${platformDomain}`,   // leading dot = all subdomains
        },
      },
    },
  }),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (!checkLoginRateLimit(credentials.email)) {
          throw new Error("TooManyAttempts");
        }

        let author;
        try {
          author = await prisma.author.findUnique({
            where: { email: credentials.email },
            include: { plan: true },
          });
        } catch (err) {
          console.error("[auth] prisma error:", err);
          return null;
        }

        if (!author || !author.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, author.passwordHash);
        if (!isValid) return null;

        if (!author.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        return {
          id:          author.id,
          email:       author.email,
          name:        author.displayName || author.name,
          image:       author.profileImageUrl,
          slug:        author.slug,
          isSuperAdmin: author.isSuperAdmin,
          planTier:    author.plan?.tier || "FREE",
        };
      },
    }),
  ],
  callbacks: {
    // ── Google: create or find author on first sign-in ─────────────────────
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        // Credentials sign-in — record last login time (best-effort, never blocks auth)
        if (account?.provider === "credentials" && user?.email) {
          prisma.author.update({
            where: { email: user.email },
            data: { lastLoginAt: new Date() },
          }).catch((err) => console.error("[auth] lastLoginAt update error:", err));
        }
        return true;
      }

      try {
        const email = user.email!.toLowerCase();
        const existing = await prisma.author.findUnique({
          where: { email },
          select: { id: true, emailVerified: true },
        });

        if (existing) {
          // Existing account — mark email verified if not already
          await prisma.author.update({
            where: { id: existing.id },
            data: {
              ...((!existing.emailVerified) && { emailVerified: new Date() }),
            },
          });
          // Record last login (best-effort, never blocks auth)
          prisma.author.update({
            where: { id: existing.id },
            data: { lastLoginAt: new Date() },
          }).catch((err) => console.error("[auth] lastLoginAt update error:", err));
        } else {
          // Block new account creation via Google while beta mode is active
          const sysConfig = await prisma.systemConfig.findUnique({
            where:  { id: "main" },
            select: { betaMode: true },
          });
          if (sysConfig?.betaMode) {
            return "/register?google_beta_blocked=1";
          }

          // New Google user — create author with auto-generated slug
          const freePlan = await prisma.plan.findFirst({
            where: { tier: "FREE" },
            select: { id: true },
          });
          const baseName  = user.name ?? email.split("@")[0];
          const slugBase  = slugify(baseName) || "author";
          const finalSlug = await uniqueSlug(slugBase.slice(0, 38));

          await prisma.author.create({
            data: {
              email,
              name:           baseName,
              displayName:    baseName,
              slug:           finalSlug,
              isActive:       true,
              emailVerified:  new Date(),   // Google has already verified the email
              profileImageUrl: user.image ?? null,
              ...(freePlan && { planId: freePlan.id }),
            },
          });
        }
        return true;
      } catch (err) {
        console.error("[auth] Google signIn error:", err);
        return false;
      }
    },

    // ── Enrich JWT with author fields ──────────────────────────────────────
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // Google initial sign-in — look up author for custom fields
        const author = await prisma.author.findUnique({
          where: { email: token.email! },
          include: { plan: true },
        });
        if (author) {
          token.id          = author.id;
          token.slug        = author.slug;
          token.isSuperAdmin = author.isSuperAdmin;
          token.planTier    = author.plan?.tier || "FREE";
        }
      } else if (user) {
        // Credentials initial sign-in
        token.id          = user.id;
        token.slug        = (user as any).slug;
        token.isSuperAdmin = (user as any).isSuperAdmin;
        token.planTier    = (user as any).planTier;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id          = token.id;
        (session.user as any).slug        = token.slug;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).planTier    = token.planTier;
      }
      return session;
    },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 13);
}

export async function getAuthorBySlug(slug: string) {
  return prisma.author.findUnique({
    where: { slug },
    include: {
      plan: true,
      genres: {
        include: { children: true },
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
      },
      series: {
        include: {
          books: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
