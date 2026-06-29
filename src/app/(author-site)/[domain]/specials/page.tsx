import { redirect } from "next/navigation";

// Specials are now shown as a section at the top of the Books page.
// This route is kept as a permanent redirect for bookmarked / indexed links.
export default async function SpecialsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  redirect(`/${domain}/books`);
}
