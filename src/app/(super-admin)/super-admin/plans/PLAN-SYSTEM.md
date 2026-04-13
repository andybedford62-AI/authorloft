# AuthorLoft Plan System — Super Admin Reference

## Overview

Plans control what each author account can do on the platform. Every author is assigned one plan. If no plan is assigned, the platform falls back to the **default plan** (whichever plan has "Is Default" ticked). If no default plan exists either, the author gets no access to paid features.

Plans are fully configurable by super admins at **Super Admin → Plans**. No code changes are needed to adjust limits or features — everything is stored in the database and takes effect immediately.

---

## The Three Tiers

| Tier | Slug | Intended Use |
|------|------|-------------|
| FREE | `free` | Trial / no-cost accounts. Limited features. |
| STANDARD | `standard` | Paid entry-level subscription. Core features enabled. |
| PREMIUM | `premium` | Full-access paid subscription. All features and unlimited content. |

Each tier maps to exactly one Plan record. The `PlanTier` enum in the database enforces this — you cannot have two FREE plans, for example.

---

## What Each Setting Controls

### Quantity Limits

| Field | What It Does | Blank / null = |
|-------|-------------|----------------|
| Max Books | Maximum number of books the author can create | Unlimited |
| Max Posts | Maximum number of posts the author can **publish** (drafts are always free) | Unlimited |
| Max Storage MB | Reserved for future upload-size enforcement | Not currently enforced |

When an author hits a limit, the API returns a clear error message telling them to upgrade. The create/publish action is blocked server-side — it cannot be bypassed from the front end.

### Feature Flags

| Flag | What It Unlocks | Blocked action when off |
|------|----------------|------------------------|
| Custom Domain | Ability to map a custom domain (e.g. `www.myname.com`) | Set by super admin manually — authors cannot self-serve this |
| Sales Enabled | Creating direct-sale items on books (selling ebooks, flip books, print) | POST to `/api/admin/books/[id]/direct-sales` returns 403 |
| Newsletter | Sending newsletter campaigns to subscribers | POST to `/api/admin/newsletter/send` returns 403 |
| Analytics | Viewing the analytics dashboard | Not yet wired to a specific API — feature page can check this |
| Flip Books | Creating and publishing flip books | Not yet wired — future enforcement point |

---

## How Plan Assignment Works

1. **At signup** — authors get no plan by default. The platform falls back to whichever plan has `isDefault = true`. Set your Free plan as the default so new sign-ups get appropriate access automatically.

2. **Super admin assigns a plan** — go to Super Admin → Authors, click the pencil icon on any author, and use the Plan dropdown in the edit form.

3. **Plan changes are instant** — the next API call the author makes will use the new limits. There is no cache to clear.

---

## Recommended Default Configuration

### Free Plan
- Max Books: `3`
- Max Posts: `5`
- Max Storage: blank (not enforced yet)
- Custom Domain: ❌
- Sales: ❌
- Newsletter: ❌
- Analytics: ❌
- Flip Books: ❌
- Is Default: ✅ (new sign-ups land here)

### Standard Plan
- Max Books: `20`
- Max Posts: blank (unlimited)
- Custom Domain: ✅
- Sales: ✅
- Newsletter: ✅
- Analytics: ❌
- Flip Books: ❌

### Premium Plan
- Max Books: blank (unlimited)
- Max Posts: blank (unlimited)
- Custom Domain: ✅
- Sales: ✅
- Newsletter: ✅
- Analytics: ✅
- Flip Books: ✅

---

## Enforcement Points in the Codebase

| Enforcement | File | Check |
|-------------|------|-------|
| Creating a book | `src/app/api/admin/books/route.ts` | `canAddBook()` |
| Publishing a post | `src/app/api/admin/blog/route.ts` | `canPublishPost()` |
| Creating a direct sale item | `src/app/api/admin/books/[id]/direct-sales/route.ts` | `canUseFeature("salesEnabled")` |
| Sending a newsletter | `src/app/api/admin/newsletter/send/route.ts` | `canUseFeature("newsletter")` |

All enforcement goes through `src/lib/plan-limits.ts`. To add enforcement to a new route, import `canAddBook`, `canPublishPost`, or `canUseFeature` from that file and call it after the session check.

---

## Managing Plans — Step by Step

### Create a new plan
1. Go to Super Admin → Plans
2. Click **New Plan**
3. Fill in Basic Info (name, slug, tier, description)
4. Set Pricing (monthly/annual in pence — e.g. £9.99/mo = `999`)
5. Set Limits (leave blank for unlimited)
6. Toggle Feature Flags on or off
7. Set Sort Order (controls display order on pricing pages)
8. Save

### Edit an existing plan
1. Go to Super Admin → Plans
2. Click the pencil icon on the plan row
3. Make changes — they take effect immediately for all authors on that plan
4. Save

### Deactivate a plan (stop new sign-ups without deleting)
1. Edit the plan
2. Uncheck **Active**
3. Save — existing subscribers keep access, but the plan won't appear in new sign-up flows

### Delete a plan
- Only possible if **no authors are currently assigned to it**
- The delete button is blocked with a tooltip if there are active subscribers
- Reassign those authors to another plan first

### Assign a plan to an author
1. Go to Super Admin → Authors
2. Click the pencil icon on the author
3. Select the plan from the **Plan** dropdown
4. Save Changes

---

## Error Messages Authors See

When a plan limit blocks an action, the author sees one of these messages:

- *"Your plan allows up to 3 books. Upgrade your plan to add more."*
- *"Your plan allows up to 5 published posts. Upgrade your plan to publish more."*
- *"Your current plan does not include direct sales. Upgrade your plan to access this feature."*
- *"Your current plan does not include newsletter. Upgrade your plan to access this feature."*

These messages come from `src/lib/plan-limits.ts` and can be edited there.
