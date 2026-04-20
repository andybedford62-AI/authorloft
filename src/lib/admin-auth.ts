import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function resolveAuthorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const sessionAuthorId = (session.user as any).id as string;
  const isSuperAdmin    = (session.user as any).isSuperAdmin || false;

  if (isSuperAdmin) {
    const cookieStore = await cookies();
    const impersonateCookie = cookieStore.get("al_impersonate");
    if (impersonateCookie?.value) return impersonateCookie.value;
  }

  return sessionAuthorId;
}

/**
 * For page components — redirects to /login if unauthenticated.
 * Returns impersonated author ID when a super admin is impersonating.
 */
export async function getAdminAuthorId(): Promise<string> {
  const id = await resolveAuthorId();
  if (!id) redirect("/login");
  return id;
}

/**
 * For API route handlers — returns null if unauthenticated (no redirect).
 * Returns impersonated author ID when a super admin is impersonating.
 */
export async function getAdminAuthorIdForApi(): Promise<string | null> {
  return resolveAuthorId();
}
