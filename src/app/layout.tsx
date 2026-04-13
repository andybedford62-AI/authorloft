import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AuthorLoft — The Author Website Platform",
    template: "%s | AuthorLoft",
  },
  description:
    "Build your author website with AuthorLoft. Catalog management, digital book sales, newsletter capture, flip books, and more — no coding required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      
      <body className={`${inter.className} min-h-full`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
