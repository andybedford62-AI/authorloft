# Vault Visual Identity — Decision Record

**Status: shipped site-wide (public marketing site).** August 15, 2026 shipped
Vault to the homepage; August 28, 2026 extended it across the rest of the
public marketing site and consolidated the token architecture. This file was
referenced by the CHANGELOG from the original decision but never actually
created — this is that record, written from the final state.

## What Vault is

A dark navy/gold visual identity replacing the previous generic-AI-template
look (Playfair Display + Inter, flat navy/gold, `rounded-full` pill buttons,
centered section headings — the default look shared by a huge share of AI
page-builder output).

- **Palette:** deep indigo ground (`#16233d` / `#111b30` / `#1e2f4d` /
  `#243756`), warm ink text (`#f3ecdb`), brass-gold accent used sparingly
  (`#d6a94a` / `#e2bc6e` / `#a8752a`), muted blue-gray secondary text
  (`#93a0bc`), hairline borders (`#2c3f5e`). A light "cream" companion
  palette (`#f5f0e8` background, `#1a1008` ink) exists for deliberate
  palette breaks — the homepage's mid-page newsletter section, the sitewide
  footer.
- **Typography:** Georgia italic (`Georgia, 'Iowan Old Style', serif`) for
  display/headline text, Helvetica Neue for body/UI. Both system fonts —
  no webfont load, no FOIT/CLS risk. Deliberately not swapped for a
  licensed webfont pairing: a distinctively-used system serif was judged
  sufficient differentiation on its own, and a swap would have undone the
  reason Georgia replaced Playfair in the first place.
- **Layout:** left-aligned section headlines (not centered), 6px button
  radius (not pill-shaped) for CTAs. Pill shape is reserved specifically
  for badges/status chips/toggles — a deliberate, distinct convention from
  buttons, not an accident of which file someone copied from.

## Token architecture

Single source of truth: a Tailwind v4 `@theme` block in
[`src/app/globals.css`](../src/app/globals.css), namespaced `--color-vault-*`
so it can never collide with the pre-existing `--navy`/`--cream`/
`--font-heading` tokens the per-author site theme system
([`src/lib/themes.ts`](../src/lib/themes.ts)) depends on. Generates real
Tailwind utilities: `bg-vault-surf`, `text-vault-gold`, `rounded-vault`,
`font-vault-display`, etc.

[`src/components/marketing/vault-theme.ts`](../src/components/marketing/vault-theme.ts)
stays alive as a manually-synced mirror for the handful of call sites that
structurally need a raw JS value rather than a className — inline SVG
`fill=`, the numeric `radius`, or a multi-stop CSS gradient (those read the
underlying `var(--color-vault-*)` custom property directly instead).

Four reusable primitives live under
[`src/components/marketing/vault/`](../src/components/marketing/vault/):
`VaultButton` (primary/secondary/subtle variants, encodes the 6px-radius
rule), `VaultCard`, `VaultSection` (left-aligned headline block + the
shared scroll-reveal entrance motion), `VaultBadge` (codifies pill-shape
as a deliberate badge-only choice).

## Scope — what's on Vault vs. what isn't

**On Vault:** the entire public marketing site — homepage, nav, footer,
pricing, features, all 12 solution/landing pages, FAQ, blog, news, guides,
resources, bookstore (catalog, cards, filters, quick-view modal).

**Explicitly NOT touched, by decision:**
- **Admin UI** — has its own separate hand-maintained dark-mode class
  allowlist system in `globals.css`. Different project, different owner
  of that decision.
- **Per-author public sites** (`src/lib/themes.ts`, the `[data-theme]`
  system) — a different theming system entirely, serving author-owned
  pages with their own genre palettes. Must never be renamed or
  restructured as a side effect of Vault work; the `--color-vault-*`
  namespace prefix exists specifically to prevent accidental collision.
- **Legal pages** (`/privacy`, `/terms`, `/gdpr`, `/us-privacy`) and
  **`/compare/[competitor]`** — inherit the shared nav/footer/typography
  automatically, but got no dedicated visual redesign pass. Low-traffic,
  low-conversion; judged not worth the effort relative to everything else
  in the rollout.

## Motion

Three signature moments, deliberately not more:
1. Scroll-reveal on section entrance — one shared implementation
   (`ScrollReveal` / the `VaultSection` primitive), not reinvented per page.
2. Gold-underline/gold-text hover state on links and nav items — one
   consistent micro-interaction site-wide.
3. Hero interaction — the homepage's existing carousel mechanism
   (`rebrand-hero.tsx`), reused wherever a hero exists elsewhere rather
   than inventing a second hero motion language. Content-list pages
   (blog/news/guides) get no hero motion — it doesn't fit the content type.

Explicitly avoided: parallax, per-card stagger animations, cursor-follow
effects.

## Known drift this rollout found and fixed

Five distinct instances of the same underlying problem — a value existing
in more than one place, guaranteed to eventually disagree with itself:

1. Canonical `import { VAULT }` + inline `style={{}}` (the original,
   "correct" pattern — homepage, hero, several sections).
2. Locally duplicated `const VAULT = {...}` hex subsets (two separate
   files under `resources/`).
3. Raw Tailwind arbitrary-hex classes with no token reference at all
   (pricing, features, bookstore, most old-styled pages).
4. Hex values hand-copied by value with **no import at all** —
   `marketing-nav.tsx` had the exact Vault hex baked in as magic strings,
   invisible to a `grep "VAULT"` audit.
5. A near-but-not-quite duplicate value: `landing-page-data.tsx` used
   `#D4AE6A` for the hero-title accent word across all 12 solution
   pages — a color from an earlier, fully superseded "Rebel" design pass
   (`animated-sections.tsx` and its siblings), not `#d6a94a` vault-gold.

All five are now resolved onto the single `@theme` source of truth. A
second, unrelated bug surfaced during the same work: several files used
`var(--font-heading, serif)` expecting the `serif` fallback to apply when
unset — but `--font-heading` **is** globally defined in `globals.css` (it's
the per-author-site Playfair token), so the fallback silently never
activated. Those headings were rendering in Playfair instead of Vault's
Georgia. Fixed across the FAQ, resources, and their shared components.

## Fast-follows (not done now, flagged for later)

- **Rename `--font-heading`/`--navy`/`--cream`** to make their per-author-
  site-only ownership explicit (e.g. `--author-font-heading`) once no
  marketing-site file references them anymore. Not done in this rollout —
  it's a risky change touching 15+ author themes, deserves its own
  reviewed session.
- **Imagery direction** — commissioned author photography or an
  illustrated duotone treatment — was part of the original creative brief
  but requires sourcing real assets, a separate non-code workstream.
- `animated-sections.tsx`, `creator-animated-sections.tsx`,
  `replaces-strip.tsx`, `midnight-faq-section.tsx`, `testimonials-section.tsx`,
  and `faq-section.tsx` were all confirmed unused (no live imports) during
  this rollout and left in place — deleting confirmed-dead code wasn't in
  scope for a visual-identity pass, but they're candidates for a future
  cleanup.
