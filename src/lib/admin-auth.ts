import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Returns the effective author ID for admin pages.
 * When a super admin is impersonating another author (via al_impersonate cookie),
 * returns the impersonated author's ID so all data queries reflect their account.
 */
export async function getAdminAuthorId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sessionAuthorId = (session.user as any).id as string;
  const isSuperAdmin    = (session.user as any).isSuperAdmin || false;

  if (isSuperAdmin) {
    const cookieStore = await cookies();
    const impersonateCookie = cookieStore.get("al_impersonate");
    if (impersonateCookie?.value) return impersonateCookie.value;
  }

  return sessionAuthorId;
}
