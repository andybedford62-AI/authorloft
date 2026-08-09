# AuthorLoft — System Architecture

High-level deployment + component view. Renders on GitHub.

```mermaid
flowchart TB
    subgraph Browser["End-User Browsers"]
        Author["Author Dashboard<br/>(/admin/*)"]
        Visitor["Public Visitor<br/>(/, /blog, /news, /bookstore)"]
        SuperAdmin["Super Admin<br/>(/super-admin/*)"]
        AuthorSite["Author Custom Domain<br/>(authorname.com)"]
    end

    subgraph Vercel["Vercel (Edge + Serverless)"]
        Proxy["Edge Middleware<br/>(proxy.ts<br/>custom-domain rewrite)"]
        NextApp["Next.js 16 App Router<br/>(www.authorloft.com)"]
        Cron["Vercel Cron<br/>(7 schedules)"]
        KV["Vercel KV / Redis<br/>(rate limits, sessions)"]
        Blob["Vercel Blob Storage<br/>(book covers, uploads)"]
    end

    subgraph Supabase["Supabase (PostgreSQL)"]
        DB[("Authors, Books, Plans,<br/>Orders, Subscribers,<br/>SocialPromote*, etc.")]
        RLS["RLS enabled<br/>(no policies = deny;<br/>Prisma bypasses)"]
    end

    subgraph External["External Services"]
        Stripe["Stripe<br/>(checkout, subs, webhooks)"]
        Resend["Resend<br/>(transactional email)"]
        Gemini["Google Gemini<br/>(AI assistant + Social Promote)"]
        Posthog["PostHog<br/>(product analytics)"]
        Sentry["Sentry<br/>(error tracking)"]
        Cloudinary["Cloudinary<br/>(image transforms)"]
    end

    AuthorSite --> Proxy
    Visitor --> NextApp
    Author --> NextApp
    SuperAdmin --> NextApp
    Proxy --> NextApp

    NextApp --> DB
    NextApp --> KV
    NextApp --> Blob
    NextApp --> Stripe
    NextApp --> Resend
    NextApp --> Gemini
    NextApp --> Posthog
    NextApp --> Sentry
    NextApp --> Cloudinary

    Cron --> NextApp
    Stripe -. webhooks .-> NextApp

    DB --- RLS

    classDef external fill:#fef3c7,stroke:#d97706
    classDef vercel   fill:#e0f2fe,stroke:#0284c7
    classDef supabase fill:#dcfce7,stroke:#16a34a
    classDef browser  fill:#fce7f3,stroke:#db2777
    class Stripe,Resend,Gemini,Posthog,Sentry,Cloudinary external
    class Proxy,NextApp,Cron,KV,Blob vercel
    class DB,RLS supabase
    class Author,Visitor,SuperAdmin,AuthorSite browser
```

## Cron Jobs (Vercel)

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/reset-ai-usage` | `0 0 1 * *` | Monthly AI usage reset |
| `/api/cron/cleanup-unverified` | `0 3 * * *` | Daily unverified-account purge |
| `/api/cron/onboarding-cleanup` | `0 4 * * *` | Daily stale onboarding purge |
| `/api/cron/process-social-posts` | `0 9 * * *` | Daily super-admin social posts |
| `/api/cron/expire-trials` | `0 5 * * *` | Daily trial expiration |
| `/api/cron/launch-preorders` | `0 8 * * *` | Daily pre-order launch trigger |
| `/api/cron/social-promote-abuse-check` | `15 * * * *` | Hourly Social Promote abuse digest |

## Notes

- **Single Supabase project** (`fweccazwdlrdbcrdbbev`) — dev branch on staging.authorloft.com hits the same DB as prod, just from a different deploy slot. Migrations are NOT auto-applied on deploy.
- **Custom-domain auth** — author custom domains rewrite to www.authorloft.com via proxy.ts so cookies + sessions stay on the apex.
- **Edge middleware** — proxy.ts handles host-based rewrites; M-6 security middleware is in the same file.
