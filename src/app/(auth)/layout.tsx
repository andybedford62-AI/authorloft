import type { Metadata } from "next";

// Auth/utility pages (login, register, password reset, verify, accept terms) are
// functional forms with little content by design. Keep them out of search indexes
// so they don't surface in results or get flagged as "thin content". follow:true
// still lets crawlers follow links from these pages.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
