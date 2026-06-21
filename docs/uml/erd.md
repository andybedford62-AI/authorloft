# AuthorLoft — Data Model (ERD)

Core domain. Excludes auth/session tables (`User`, `Account`, `Session`, `VerificationToken`) and analytics dumps.

```mermaid
erDiagram
    Author ||--o{ Book : "writes"
    Author ||--o{ Order : "receives"
    Author ||--o{ Subscriber : "owns"
    Author ||--o{ AffiliateReferral : "earns from"
    Author ||--o{ GeneratedSocialPost : "generates"
    Author }o--|| Plan : "subscribed to"
    Author ||--o| AuthorSite : "has one"
    Author ||--o{ Resource : "uploads"
    Author ||--o{ TestimonialQuote : "collects"

    Book ||--o{ Order : "appears in"
    Book ||--o{ ReaderClick : "tracked by"
    Book ||--o{ AffiliateLink : "monetized via"
    Book ||--o{ FlipBook : "has format"
    Book ||--o{ AudioFile : "has format"

    Order ||--o{ OrderItem : "contains"
    Order }o--o| Coupon : "discount via"
    Order }o--o| AffiliateReferral : "attributed to"

    Plan ||--o{ Coupon : "scoped to"
    Plan ||--o{ FeatureGate : "controlled by"

    GeneratedSocialPost }o--|| SocialPromotePlatform : "targets"
    GeneratedSocialPost }o--|| SocialPromoteType : "uses"
    SocialPromoteSettings ||--|| SocialPromoteSettings : "singleton"

    PlatformPost }o--|| PostCategory : "categorized"
    Resource }o--|| ResourceCategory : "categorized"

    Author {
        string id PK
        string name
        string displayName
        string email UK
        string slug UK
        string customDomain
        string socialVoiceDescription
        string stripeCustomerId
        string planId FK
        datetime aiUsageResetAt
        int aiUsageCount
    }

    Book {
        string id PK
        string authorId FK
        string title
        string slug
        string shortDescription
        text description
        string coverImageUrl
        boolean isPublished
        boolean preOrderEnabled
        datetime preOrderReleaseAt
    }

    Order {
        string id PK
        string authorId FK
        string customerEmail
        int totalCents
        string stripeSessionId
        string status
        datetime createdAt
    }

    Plan {
        string id PK
        string tier
        int monthlyPriceCents
        int annualPriceCents
        int maxBooks
        int socialDailyLimit
        int socialMonthlyLimit
        boolean salesEnabled
        boolean newsletter
    }

    SocialPromotePlatform {
        string id PK
        string slug UK
        string name
        int maxChars
        string hashtagStyle
        boolean isPremiumOnly
        boolean isActive
    }

    SocialPromoteType {
        string id PK
        string slug UK
        string name
        text promptTemplate
        string_array applicableContexts
        string_array applicablePlatforms
        boolean isActive
    }

    GeneratedSocialPost {
        string id PK
        string authorId FK
        string platformId FK
        string promoTypeId FK
        string contextType
        string contextRefId
        text promptUsed
        text outputText
        int inputTokens
        int outputTokens
        int costMicroCents
        string status
        boolean wasCopied
        datetime createdAt
    }

    SocialPromoteSettings {
        string id PK "always main"
        boolean enabled
        string model
        int costWarnMicroCentsPerDay
        int costDisableMicroCentsPerDay
        string adminAlertEmails
    }
```

## Notes

- All money on `Order` / `Plan` / `Coupon` stored as integer cents.
- Social Promote AI cost stored as **microcents** (1 microcent = $0.000001) for precision at fractional-cent scale.
- `contextRefId` on `GeneratedSocialPost` is polymorphic: points at a `Book.id`, `PlatformPost.id` (news), or is null for free-text topic. Type discriminated by `contextType`.
- `SocialPromoteSettings.id` is always `"main"` — enforced via Prisma upsert pattern, no constraint.
- Every new table requires GRANT statements for `anon`, `authenticated`, `postgres`, `service_role` — see `project_supabase_grants.md`.
