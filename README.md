# AuthorLoft — Multi-Tenant Author Website SaaS

A complete SaaS platform for authors to build and manage professional websites with book catalogs, digital sales, newsletter capture, and flip book previews.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in your values
npx prisma migrate dev --name init
npm run dev
```

| URL | What you see |
|---|---|
| `http://localhost:3000` | AuthorLoft marketing page |
| `http://apbedford.localhost:3000` | Demo author site (A.P. Bedford) |
| `http://localhost:3000/admin/dashboard` | Admin panel |
| `http://localhost:3000/login` | Login |

## Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (email + Google OAuth) |
| Payments | Stripe (subscriptions + book purchases) |
| Storage | AWS S3 |
| Multi-tenancy | Subdomain middleware routing |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/           # AuthorLoft landing page + pricing
│   ├── (auth)/                # Login, register
│   ├── (author-site)/[domain] # Public author site (home, books, about, contact)
│   ├── (admin)/admin/         # Author admin panel
│   ├── (superadmin)/          # Platform super-admin
│   └── api/                   # Auth, newsletter, Stripe webhook, downloads
├── components/
│   ├── ui/                    # Button, Input, Badge
│   ├── author-site/           # Nav, Footer, BookCard, NewsletterForm
│   └── admin/                 # AdminSidebar
├── lib/                       # auth, db, stripe, s3, utils, placeholder-data
├── middleware.ts               # Subdomain routing
prisma/schema.prisma            # Full data model
```

## Plans

| Feature | Free | Standard ($12/mo) | Premium ($29/mo) |
|---|---|---|---|
| Books | 5 max | Unlimited | Unlimited |
| Custom domain | No | Yes | Yes |
| Digital sales | No | Yes | Yes |
| Flip books | No | Yes | Yes |
| Analytics | No | Basic | Advanced |

## Deployment

1. Deploy to **Vercel**
2. Database: **Neon** or **Supabase** (PostgreSQL)
3. DNS: **Cloudflare** wildcard `*.authorloft.com → Vercel`
4. Stripe webhook: `https://authorloft.com/api/stripe/webhook`
5. Storage: **AWS S3** bucket

## Roadmap

- [ ] Author registration flow
- [ ] Book detail page
- [ ] Series detail page
- [ ] Flip book viewer (StPageFlip)
- [ ] Specials/promotions page
- [ ] Sales analytics charts
- [ ] Double opt-in newsletter emails
- [ ] Reader accounts
