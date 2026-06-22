# Archived — June 18 2026 homepage rebrand

These files were the **pre-rebrand homepage** (`page-original-jun18.tsx.bak`)
and the **staging preview route** used during the digital-creator rebrand
exploration (`homepage-preview.tsx.bak`). The rebrand went live on the main
`/` route on June 18 2026 and was promoted to prod on June 22 2026; these
backups are kept here in case the team wants to revisit the older direction
without spelunking git history.

To restore one of them:

1. Copy the `.bak` file back into `src/app/(marketing)/`
   (e.g. `src/app/(marketing)/page.tsx` or `src/app/(marketing)/homepage-preview/page.tsx`)
2. Remove the `.bak` suffix and the leading `page-original-jun18` prefix
3. Confirm imports still resolve — components referenced at the time may have
   moved, been renamed, or had their props refactored
