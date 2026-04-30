import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "AuthorLoft — The Author Website Platform",
    template: "%s | AuthorLoft",
  },
  description:
    "Build your author website with AuthorLoft. Catalog management, digital book sales, newsletter capture, flip books, and more — no coding required.",
  icons: { icon: "/authorloft-logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      
      <body className={`${inter.variable} ${playfair.variable} ${inter.className} min-h-full`} suppressHydrationWarning>
          <PostHogProvider>{children}</PostHogProvider>
        </body>
    </html>
  );
}
