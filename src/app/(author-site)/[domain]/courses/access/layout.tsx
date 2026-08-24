import type { Metadata } from "next";

// The page itself is a client component and so cannot export metadata.
// This gated access form should never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function CourseAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
