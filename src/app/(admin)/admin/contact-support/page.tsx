import { redirect } from "next/navigation";

export default function ContactSupportRedirect() {
  redirect("/admin/help?tab=contact");
}
