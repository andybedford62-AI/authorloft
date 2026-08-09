# Admin Button Standard — Audit & Fix

Scan admin/super-admin files for non-standard buttons and optionally fix them to match the locked standard.

**Usage:**
- `/admin-buttons` — audit the entire admin and super-admin section
- `/admin-buttons src/components/admin/book-form.tsx` — audit a single file
- `/admin-buttons src/app/(super-admin)/super-admin/resources` — audit a directory
- `/admin-buttons --fix` — audit everything and apply all fixes
- `/admin-buttons src/path/to/file.tsx --fix` — audit and fix a specific file

---

## The Locked Standard (reference before making any changes)

| Action | Component | Variant | Icon | Label |
|--------|-----------|---------|------|-------|
| Save / Update | `<Button>` | `primary` (default) | `<Check className="h-4 w-4 mr-2" />` | "Save", "Save Changes", "Save [X]" |
| Create (new record) | `<Button>` | `primary` | `<Plus className="h-4 w-4 mr-2" />` | "Create [X]" |
| Add (header CTA) | `<Button>` | `primary` | `<Plus className="h-4 w-4 mr-2" />` | "Add [X]" |
| Add-form submit | `<Button>` | `primary` | `<Check className="h-4 w-4 mr-2" />` | "Save [X]" — NOT "Add [X]" |
| Cancel | `<Button>` | `ghost` | none | "Cancel" |
| Delete / Remove | `<Button>` | `danger` | `<Trash2 className="h-4 w-4 mr-1.5" />` | "Delete [X]" or "Remove [X]" |
| Upload / Replace | `<Button>` | `outline` | `<UploadCloud>` | "Upload/Replace…" |
| Row edit (table) | `<IconButton variant="edit">` | — | Pencil | icon only |
| Row delete (table) | `<IconButton variant="delete">` | — | Trash2 | icon only |

**Size rules:** `md` (h-10) for page-level forms · `sm` (h-8) for tab/inline forms · never `lg`

**Loading state:** `<Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…` (use `mr-1.5` for `sm`)

**`danger` variant** = muted gray at rest, turns red on hover — defined in `src/components/ui/button.tsx`

**Imports always needed:**
```tsx
import { Check, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
```

---

## Step 1 — Parse Arguments

Read `$ARGUMENTS`. Extract:
- A file path or directory path (if provided) — default to both `src/app/(admin)` and `src/app/(super-admin)` and `src/components/admin` if none given
- A `--fix` flag (if present, apply fixes; otherwise report only)

---

## Step 2 — Scan for Non-Standard Patterns

Use Grep to search the target path(s) for these red-flag patterns. Search each pattern separately and collect all findings:

**Pattern A — Hand-rolled coloured buttons (must convert to `<Button>`):**
```
bg-purple-600|bg-blue-600|bg-indigo-600
```
Filter to lines that are inside a `<button` or `<a` or `<Link` element (i.e. the line contains `className=` with the colour). Toggle switches (`inline-flex h-5 w-9`) are NOT buttons — skip those.

**Pattern B — Solid red delete buttons (must use `danger` variant instead):**
```
bg-red-600
```
Skip lines that are status/alert backgrounds (look for context — if it's inside `<p className=` or `<div className=` it's an alert, not a button).

**Pattern C — Outline buttons with manual red className override (must use `danger` variant):**
```
variant="outline"
```
For each match, check if the same element or nearby lines have `text-red-600` or `border-red-200` in the className. If yes, it needs fixing.

**Pattern D — `<Save` icon in CRUD buttons (replace with `<Check`):**
```
<Save className=
```
Only flag when it's inside a button/submit context (not icon-only display).

**Pattern E — Cancel buttons with `variant="outline"` (should be `ghost`):**
Look for buttons labelled "Cancel" that use `variant="outline"`.

---

## Step 3 — Report Findings

Present a clear table of findings grouped by file:

```
## Audit Results

### src/app/(admin)/admin/appearance/appearance-client.tsx
| Line | Issue | Current | Fix |
|------|-------|---------|-----|
| 563  | Hand-rolled purple button | `<button className="...bg-purple-600...">` | `<Button>` with Check icon |
| 572  | Ghost candidate | `<button className="...border border-gray-200...">Cancel` | `<Button variant="ghost">` |

### src/components/admin/some-form.tsx
...

## Summary
- X files need changes
- Y hand-rolled colour buttons → convert to <Button>
- Z danger variant needed
- W Cancel buttons → ghost
```

If no issues are found, say "✓ All buttons in [path] match the standard."

---

## Step 4 — Fix (only if `--fix` flag was passed)

For each non-standard button found:

1. **Read** the full file to understand context (imports, surrounding code)
2. **Edit** using the standard patterns from the table above:
   - Replace `<button className="...bg-purple-600...">` → `<Button>` with appropriate variant + icon
   - Replace `<a className="...bg-purple-600...">` → keep as `<Link>` but apply primary button Tailwind classes: `inline-flex items-center gap-2 rounded font-medium h-10 px-5 text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-opacity`
   - Replace solid red delete → `variant="danger"` + Trash2 icon
   - Replace outline+red className → `variant="danger"` + Trash2 icon, remove className override
   - Replace `<Save` → `<Check`
   - Replace Cancel `variant="outline"` → `variant="ghost"`
3. **Add** missing imports (`Button`, `Check`, `Plus`, `Trash2`, `Loader2`) to the import block — only add what's actually used
4. **Remove** unused imports (e.g. `Save` if fully replaced by `Check`)

After all edits, run `npx tsc --noEmit` to verify no TypeScript errors. Report any errors and fix them before finishing.

---

## Step 5 — Summary

After fixing, report:
```
## Changes Applied
- appearance-client.tsx: 2 Apply Colour buttons, 2 revert buttons
- resources-client.tsx: Add Resource (Plus), Save (Check), Cancel (ghost)
...

Run on staging to QA:
- Admin → Appearance (accent + secondary colour pickers)
- Super Admin → Resources
...
```

If `--fix` was NOT passed, end with: "Run `/admin-buttons --fix` to apply all changes, or `/admin-buttons [file] --fix` to fix one file at a time."

---

## What NOT to Change

Do not convert these — they look like buttons but aren't CRUD actions:
- Toggle switches: `inline-flex h-5 w-9 items-center rounded-full` — these are on/off toggles
- Tab bar / mode toggles: `border-b-2` active indicator or pill-style segment controls (`rounded-full px-4 py-1.5`) — these are navigation/filter controls, even if they use `bg-blue-600` for the active state
- Sidebar nav items
- Progress step indicators
- Badge/pill colour classes (`bg-purple-600 text-white px-1.5 py-0.5 rounded`)
- Status/alert divs (`<p className="...bg-red-50...">`, `<div className="...bg-red-50...">`)
- Small inline text-link remove actions for image fields (`text-xs text-red-500 hover:text-red-600`) — these are field-clear helpers, not form-level deletes
- **AI generation buttons** (`bg-amber-400 text-gray-900` + `<Sparkles>` icon) — these are a distinct "AI action" visual category used in SEO Audit and AI Assistant tabs. Leave them amber. Do NOT convert to `<Button>` with Check/Plus.
- **Upgrade Plan CTAs** (`bg-blue-600` with `<Zap>` icon) — intentional blue to signal a payment/subscription action, distinct from CRUD. Appears in `admin-shell.tsx`, `settings/page.tsx` billing section, and `book-edit-tabs-client.tsx`. Leave them blue.
- **"Copy" utility buttons** in result boxes (`text-xs text-gray-400`) — utility icon, not CRUD
- Onboarding modal buttons (`onboarding-modal.tsx`, `onboarding-guided-modal.tsx`) — these have their own visual language
- Rich text editor toolbar buttons — inline formatting tools, not CRUD
