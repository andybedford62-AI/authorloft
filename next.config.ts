import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline + unsafe-eval for hydration scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  // Supabase storage (covers any project ref), Google user avatars, Stripe branding
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://lh3.googleusercontent.com https://q.stripe.com",
  "font-src 'self' data:",
  // Supabase storage uploads are initiated from the browser directly
  // PostHog client-side event capture (page-view tracking) — both possible ingest regions
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.ingest.us.sentry.io https://us.i.posthog.com https://eu.i.posthog.com",
  // Stripe 3D Secure and payment frames
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "media-src 'self' https://*.supabase.co https://*.amazonaws.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options",           value: "SAMEORIGIN"                   },
  { key: "X-Content-Type-Options",    value: "nosniff"                      },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy",   value: ContentSecurityPolicy         },
];

const nextConfig: NextConfig = {
  // Baked at build time so the super-admin build stamp can show when prod was deployed.
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
  async rewrites() {
    return [
      { source: "/robots.txt",  destination: "/api/internal/robots" },
      { source: "/sitemap.xml", destination: "/api/internal/sitemap" },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // Amazon product images (used in seed data)
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      // AWS S3 (for uploaded covers)
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      // Supabase storage (if used for images)
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Google Books API cover thumbnails
      {
        protocol: "https",
        hostname: "books.google.com",
      },
      // Open Library cover images (fallback for KDP / self-published ISBNs)
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      // Unsplash (demo author images)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Allow any HTTPS hostname so authors can paste URLs from any site
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
