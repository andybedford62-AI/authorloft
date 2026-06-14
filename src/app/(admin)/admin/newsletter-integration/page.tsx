import { redirect } from "next/navigation";

export default function NewsletterIntegrationRedirect() {
  redirect("/admin/newsletter?tab=integrations");
}
