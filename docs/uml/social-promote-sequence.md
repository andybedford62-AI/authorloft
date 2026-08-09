# Social Promote — Generation Sequence

End-to-end flow of one Social Promote generation, from author click to copy-paste.

```mermaid
sequenceDiagram
    autonumber
    actor Author
    participant UI as PromotePanel<br/>(/admin/promote)
    participant API as POST /api/social-promote/generate
    participant Limits as checkPlatformAvailable<br/>+ checkAuthorEntitlement
    participant Gen as generate.ts
    participant Prompt as prompt-assembly.ts
    participant Gemini as Google Gemini API
    participant DB as Supabase<br/>(GeneratedSocialPost)
    participant Alerts as cost-alerts.ts
    participant Email as Resend
    participant Sentry

    Author->>UI: Pick context (book/news/topic) + platform + promo type
    Author->>UI: Click "Generate post"
    UI->>API: POST {platformSlug, promoTypeSlug, contextType, contextRefId, topicText}

    API->>Limits: enforceRateLimit("ai", 20/60s)
    API->>Limits: checkPlatformAvailable()
    Note over Limits: env kill switch?<br/>DB kill switch?<br/>cost ceiling hit?
    Limits-->>API: allowed | blocked

    API->>Limits: checkAuthorEntitlement(authorId)
    Note over Limits: plan allows feature?<br/>daily limit?<br/>monthly limit?
    Limits-->>API: allowed | blocked

    API->>Gen: generateSocialPost(req)
    Gen->>DB: load Settings, Platform, PromoType, Author (parallel)
    DB-->>Gen: rows

    Gen->>DB: load context (Book by authorId-check / PlatformPost / topic)
    DB-->>Gen: context

    Gen->>Prompt: assemblePrompt(inputs)
    Note over Prompt: 1) SYSTEM_PROMPT<br/>2) author_data block (clipped, untrusted)<br/>3) substituted promo template<br/>4) platform constraints<br/>5) platform addendum
    Prompt-->>Gen: assembledPrompt

    Gen->>Gemini: generateContent(prompt) with timeout
    alt success
        Gemini-->>Gen: outputText + usage tokens
        Gen->>DB: INSERT GeneratedSocialPost (status=SUCCESS)
        Gen->>Alerts: checkCostCeilingsAfterGen(thisGenCost)
        alt just crossed warn ceiling
            Alerts->>Email: sendMail (warn)
        else just crossed disable ceiling
            Alerts->>DB: UPDATE SocialPromoteSettings.enabled=false
            Alerts->>Email: sendMail (auto-disabled)
        end
        Gen-->>API: {ok:true, postId, outputText, ...}
        API-->>UI: 200 {postId, outputText, maxChars, platform, promoType}
        UI-->>Author: Render post + hashtag chips
    else failure or timeout
        Gemini--xGen: error
        Gen->>Sentry: captureException(err, tags+extra)
        Gen->>DB: INSERT GeneratedSocialPost (status=FAILED)
        Gen-->>API: {ok:false, userMessage}
        API-->>UI: 5xx {error}
        UI-->>Author: Show retry-able error
    end

    Author->>UI: Click hashtag chips to remove/restore
    Author->>UI: Click "Copy"
    UI->>UI: navigator.clipboard.writeText(displayedText)
    UI->>API: POST /api/social-promote/copied/[id]
    API->>DB: UPDATE wasCopied=true, copiedAt=now

    Note right of Author: Paste to Instagram / X / LinkedIn / etc.
```

## Hourly Abuse Check (separate cron)

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Vercel Cron<br/>(15 * * * *)
    participant Check as /api/cron/social-promote-abuse-check
    participant DB as Supabase
    participant Email as Resend

    Cron->>Check: GET (Bearer CRON_SECRET)
    Check->>DB: groupBy authorId, count gens in last 24h
    Check->>DB: groupBy ipAddress, count gens in last 24h
    Note over Check: avgPerAuthor = total / activeAuthors<br/>authorThreshold = max(20, avg * 5)
    alt any author or IP over threshold
        Check->>DB: enrich flagged authors with name/email
        Check->>Email: digest email to adminAlertEmails
    else nothing flagged
        Check-->>Cron: {ok:true, flagged:0}
    end
```

## Kill-Switch Precedence (highest first)

1. `SOCIAL_PROMOTE_KILL_SWITCH` env var (set + not `"false"`) — instant disable, no DB needed.
2. `SocialPromoteSettings.enabled = false` — manual or auto-tripped via cost ceiling.
3. Daily cost ceiling reached — surfaces in `author-context.ts` as `costCeilingHit`.
4. Per-author plan limits (`socialDailyLimit` / `socialMonthlyLimit`).
5. Rate limiter (20 req / 60s on the `"ai"` bucket).
