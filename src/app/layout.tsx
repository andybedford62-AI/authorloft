import type { Metadata } from "next";
// Self-hosted from npm (same files and unicode-range subsets Google serves) so
// builds never download fonts: a failed fonts.gstatic.com fetch during
// next/font/google's build step broke a prod deploy on Sept 26, 2026.
// Family names are mapped to --font-inter / --font-playfair in globals.css.
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import { Analytics } from "@vercel/analytics/next";
import { ConsentBanner } from "@/components/consent-banner";
import { PostHogPageTracker } from "@/components/posthog-page-tracker";
import "./globals.css";

const PLATFORM_URL = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const metadata: Metadata = {
  metadataBase: new URL(PLATFORM_URL),
  title: {
    default: "AuthorLoft — Own Your Author Business",
    template: "%s | AuthorLoft",
  },
  description:
    "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
  icons: { icon: "/authorloft-logo.png" },
  openGraph: {
    type:        "website",
    siteName:    "AuthorLoft",
    title:       "AuthorLoft — Own Your Author Business",
    description: "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
    url:         PLATFORM_URL,
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AuthorLoft — Own Your Author Business",
    description: "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://q.stripe.com" />

        {/* Google Ads tag — raw script in <head> so Google's verifier detects it in initial HTML */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}', {'anonymize_ip': true});
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="site-font-body min-h-full" suppressHydrationWarning>
        {children}
        <PostHogPageTracker />
        {/* Vercel Web Analytics — cookieless, served from /_vercel/insights on
            our own origin (CSP 'self'), so it runs alongside the consent banner. */}
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
