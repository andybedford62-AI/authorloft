import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Re-queries the DB on every call so revocations take effect immediately.
 * Returns the authenticated super-admin's authorId, or null if unauthorized.
 */
export async function requireSuperAdminId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const id = (session.user as any).id as string;
  if (!id) return null;
  const author = await prisma.author.findUnique({
    where:  { id },
    select: { isSuperAdmin: true },
  });
  return author?.isSuperAdmin ? id : null;
}
