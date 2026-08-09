# AuthorLoft — User Flow

End-to-end author journey: discovery → signup → publish → sell → grow.

```mermaid
flowchart LR
    Start(("Visitor")) --> Marketing["Marketing Site<br/>(/, /features, /pricing)"]
    Marketing --> Register["/register<br/>(email + password)"]
    Marketing --> Login["/login"]

    Register --> Verify["Email verification<br/>(Resend)"]
    Verify --> Onboarding["/admin/onboarding<br/>(name, slug, plan pick)"]
    Onboarding -->|FREE plan| Dashboard
    Onboarding -->|STANDARD or PREMIUM| Stripe["Stripe Checkout"]
    Stripe -->|webhook success| Dashboard

    Login --> Dashboard["/admin<br/>(author dashboard)"]

    Dashboard --> BookCreate["/admin/books/new<br/>(title, cover, description)"]
    BookCreate --> BookPublish{"Publish?"}
    BookPublish -->|Yes| Live["Public book page<br/>(authorname.com/books/title<br/>or authorloft.com/a/slug/books/title)"]
    BookPublish -->|Draft| BookEdit["/admin/books/[id]"]

    Live --> Reader(("Reader"))
    Reader -->|Click Buy| Cart["Cart drawer"]
    Cart --> Checkout["Stripe Checkout"]
    Checkout -->|webhook| Order["Order record + email receipt"]

    Dashboard --> Promote["/admin/promote<br/>(Social Promote)"]
    Promote --> ChoosePlatform["Pick platform + promo type"]
    ChoosePlatform --> Generate["Gemini generates post"]
    Generate --> CopyPaste["Author copies + pastes externally"]

    Dashboard --> Newsletter["/admin/subscribers<br/>(broadcast email)"]
    Dashboard --> Analytics["/admin/analytics<br/>(sales, reader clicks)"]
    Dashboard --> Settings["/admin/settings<br/>(plan, domain, billing)"]

    Settings -->|Upgrade plan| Stripe
    Settings -->|Custom domain| DomainSetup["Verify CNAME, SSL auto-provisioned"]

    classDef start fill:#fce7f3,stroke:#db2777
    classDef external fill:#fef3c7,stroke:#d97706
    classDef money fill:#dcfce7,stroke:#16a34a
    class Start,Reader start
    class Stripe,Checkout,Verify external
    class Order money
```

## Critical Branches

- **Custom-domain visitors** never see authorloft.com — proxy.ts at the edge rewrites them transparently. Author pages load from the same Next.js app.
- **Plan downgrades** keep the author's data intact; features become read-only at the gate. Stripe controls the entitlement state via subscription webhooks.
- **Social Promote** is end-to-end stateless from the author's perspective — they generate, copy, and post manually to the external platform. No OAuth integration in this version.
