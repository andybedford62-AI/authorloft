import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "";
// vercel.app is on the Public Suffix List — browsers reject subdomain cookies for it.
// Only apply a custom cookie domain when using a real custom domain (e.g. authorloft.com).
const isPublicSuffixDomain = platformDomain.includes("vercel.app") || platformDomain.includes("localhost");
const useCustomCookieDomain = platformDomain && !isPublicSuffixDomain;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
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
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[auth] authorize called, email:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] missing credentials");
          return null;
        }

        let author;
        try {
          author = await prisma.author.findUnique({
            where: { email: credentials.email },
            include: { plan: true },
          });
          console.log("[auth] author found:", !!author);
        } catch (err) {
          console.error("[auth] prisma error:", err);
          return null;
        }

        if (!author || !author.passwordHash) {
          console.log("[auth] no author or no hash");
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          author.passwordHash
        );
        console.log("[auth] bcrypt result:", isValid);
        if (!isValid) return null;

        return {
          id: author.id,
          email: author.email,
          name: author.displayName || author.name,
          image: author.profileImageUrl,
          slug: author.slug,
          isSuperAdmin: author.isSuperAdmin,
          planTier: author.plan?.tier || "FREE",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.slug = (user as any).slug;
        token.isSuperAdmin = (user as any).isSuperAdmin;
        token.planTier = (user as any).planTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).slug = token.slug;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).planTier = token.planTier;
      }
      return session;
    },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
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
