# AuthorLoft — Integrations & Features Reference

A living document. Update this file whenever a new integration or major feature is added.

---

## External Services

### Stripe
**Purpose:** Payment processing — author subscriptions and reader direct sales.

| Feature | Details |
|---------|---------|
| Subscriptions | Authors upgrade from Free → Standard / Premium via Stripe Checkout |
| Direct Sales | Readers buy books (eBook, Audio, Flipbook, Print) via Stripe Checkout |
| Stripe Connect | Authors onboard to receive payouts (`/admin/settings` → Stripe Payouts) |
| Customer Portal | Authors manage billing, cancel, download invoices via Stripe-hosted portal |
| Webhooks | `/api/stripe/webhook` handles `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.*` |
| Discount Codes | Stripe coupon objects created and validated at checkout |

**Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`

---

### Resend
**Purpose:** All transactional email.

| Email | Trigger |
|-------|---------|
| Email verification | On registration and resend request |
| Password reset | Forgot-password flow |
| Order confirmation | Single consolidated receipt per multi-item purchase (Stripe webhook) |
| Sale notification | Per-item alert to the author when a book sells |
| Subscription welcome | On first paid subscription activation |
| Renewal reminder | 7-day banner + email before subscription expires |
| Payment failed | On `invoice.payment_failed` Stripe event |

**File:** `src/lib/mailer.ts`  
**Env vars:** `RESEND_API_KEY`, `EMAIL_FROM`

---

### PostHog
**Purpose:** Product analytics — platform-wide and per-author site.

| Feature | Details |
|---------|---------|
| Page views | Auto-tracked on every route change across admin + author sites |
| User identification | Authors identified with id, email, name, planTier, slug |
| `signed_up` event | Fired after successful registration |
| `upgraded_to_paid` event | Fired via server-side webhook on plan purchase |
| Author analytics dashboard | `/admin/analytics` — queries PostHog HogQL API server-side, filtered by author's subdomain/custom domain; shows views over time, top pages, traffic sources, geography |
| Super admin dashboard link | External PostHog shared dashboard linked in super admin sidebar |

**Files:** `src/components/posthog-provider.tsx`, `src/app/api/admin/analytics/route.ts`, `src/app/(admin)/admin/analytics/page.tsx`  
**Env vars:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`

---

### AWS S3
**Purpose:** File storage for all uploaded assets.

| Asset | Details |
|-------|---------|
| Book covers | Uploaded via `/api/admin/upload/cover` |
| Profile / logo / hero images | Branding uploads |
| Direct sale files | eBook (PDF/EPUB), audio files |
| ARC files | Advanced reader copy distribution |
| Flip book files | PDF source for interactive flip books |
| Blog / page images | Rich text editor image uploads |
| Special images | Promotional image uploads |

Pre-signed URLs generated server-side; files uploaded directly from browser to S3.

**Files:** `src/lib/s3.ts`, `src/app/api/admin/upload/**`  
**Env vars:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`

---

### Google Generative AI (Gemini)
**Purpose:** AI-powered author tools in the admin dashboard.

| Tool | Route | Details |
|------|-------|---------|
| Book Descriptions | `/admin/ai-assistant` | Generates marketing blurbs from title/genre/synopsis |
| Blog Ideas | `/admin/ai-assistant` | Topic and outline suggestions |
| Marketing Copy | `/admin/ai-assistant` | Social posts, email copy, ad copy |
| Reader Feedback | `/admin/ai-assistant` | Sentiment analysis on reader reviews |
| SEO Meta Tags | `/admin/seo-audit` | Generates meta title + description per book |
| SEO Keyword Density | `/admin/seo-audit` | Keyword analysis on book descriptions |
| SEO Internal Links | `/admin/seo-audit` | Internal linking recommendations |

Authors can supply their own Gemini API key (`/admin/settings` → AI Key) to bypass the platform usage cap (20 requests/month per author).

**Files:** `src/app/api/admin/ai/**`, `src/app/api/admin/settings/ai-key/route.ts`  
**Env vars:** `GEMINI_API_KEY` (platform key), or per-author key stored in DB

---

### NextAuth
**Purpose:** Session-based authentication for admin dashboard and super admin.

- Credentials provider (email + bcrypt password)
- JWT sessions
- Super admin flag on session token
- Impersonation via `al_impersonate` cookie (super admin only)

**Files:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`  
**Env vars:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

---

### Vercel KV (Redis)
**Purpose:** Rate limiting on sensitive endpoints.

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/forgot-password` | 5 requests / 15 min per IP |
| `POST /api/auth/resend-verification` | 5 requests / 15 min per user |
| Auth endpoints (general) | Via `RATE_LIMITS.auth` config |

Falls back to in-memory store if KV is unavailable (development).

**Files:** `src/lib/rate-limit.ts`  
**Env vars:** `KV_REST_API_URL`, `KV_REST_API_TOKEN`

---

### Prisma + PostgreSQL (Supabase)
**Purpose:** Primary database — all application data.

Managed via Prisma ORM. Database hosted on Supabase.

**Files:** `prisma/schema.prisma`, `src/lib/db.ts`  
**Env vars:** `DATABASE_URL`, `DIRECT_URL`

---

## Platform Features (No External Service)

| Feature | Description | Key Files |
|---------|-------------|-----------|
| Toast notifications | Global error/success toast system usable across all admin pages | `src/lib/use-toast.ts`, `src/components/toast-provider.tsx` |
| Multi-tenancy | Author sites served via subdomain (`{slug}.authorloft.com`) or custom domain via Next.js middleware | `src/middleware.ts` |
| Beta / access control | Beta mode toggle, invite codes, access request workflow | `src/app/api/auth/beta-status`, `/super-admin/access-requests` |
| Impersonation | Super admins can act as any author via cookie | `src/lib/admin-auth.ts`, `src/components/admin/impersonation-banner.tsx` |
| Feature gates | Plan-tier gating (FREE / STANDARD / PREMIUM) for features like Flip Books, Media Kit, AI tools | `src/lib/feature-gates.ts` |
| Cron jobs | Cleanup unverified accounts (day 14), reset monthly AI usage counters | `src/app/api/cron/**` |
| Maintenance mode | Super admin toggle to take platform offline with custom message | `src/app/api/maintenance-check/route.ts` |

---

## Env Var Quick Reference

| Variable | Service | Required |
|----------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Yes |
| `RESEND_API_KEY` | Resend | Yes |
| `EMAIL_FROM` | Resend | Yes |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog | Yes |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog | Yes |
| `POSTHOG_PERSONAL_API_KEY` | PostHog | Yes (analytics dashboard) |
| `POSTHOG_PROJECT_ID` | PostHog | Yes (analytics dashboard) |
| `AWS_ACCESS_KEY_ID` | AWS S3 | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 | Yes |
| `AWS_REGION` | AWS S3 | Yes |
| `AWS_S3_BUCKET` | AWS S3 | Yes |
| `GEMINI_API_KEY` | Google AI | Yes |
| `NEXTAUTH_SECRET` | NextAuth | Yes |
| `NEXTAUTH_URL` | NextAuth | Yes |
| `DATABASE_URL` | Supabase/Prisma | Yes |
| `DIRECT_URL` | Supabase/Prisma | Yes |
| `KV_REST_API_URL` | Vercel KV | Yes (rate limiting) |
| `KV_REST_API_TOKEN` | Vercel KV | Yes (rate limiting) |
