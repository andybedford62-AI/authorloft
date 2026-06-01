import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CouponsClient } from "./coupons-client";

export default async function CouponsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");
  return <CouponsClient />;
}
