import { redirect } from "next/navigation";

// The standalone Bundles listing merged into a Books|Bundles tab switcher on
// /books (see books-bundles-tabs.tsx) so the site nav only needs one entry.
// This route stays alive as a redirect so existing bookmarks/backlinks don't
// break. Individual bundle pages (/bundles/[slug]) are untouched.
export default function BundlesRedirect() {
  redirect("/books?tab=bundles");
}
