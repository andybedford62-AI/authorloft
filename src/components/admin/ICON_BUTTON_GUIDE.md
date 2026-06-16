# Admin Icon Button Standardization Guide

## Philosophy
- **Text buttons** for primary CTAs and form submissions (Add, Save, Cancel at top level)
- **Icon buttons** for compact spaces: data table rows, inline actions, dense UIs
- **Consistent styling** across all icon buttons with color coding

## Icon Button Variants & Colors

These are the **only** variants. Keep the palette small so the whole admin reads
as one cohesive system. (`<IconButton>` lives in `icon-button.tsx`.)

| Variant | Use Case | Color |
|---------|----------|-------|
| `edit` (blue) | Edit, Pencil, Configure | Blue → darker blue on hover |
| `add` (green) | Plus, Add, Create, Activate, Save/Confirm | Green → darker green on hover |
| `delete` (red) | Trash, Delete, Remove | Red → darker red on hover |
| `warning` (amber) | Deactivate, Archive, caution actions | Amber → darker amber on hover |
| `view` (dark) | Eye, View, Preview | Dark gray → darker on hover |
| `ghost` (gray) | Secondary, More, Reorder, Cancel/Close | Gray → darker gray on hover |

## Usage Examples

### In Data Table Rows
```tsx
import { IconButton } from "@/components/admin/icon-button";
import { Edit2, Trash2, Eye } from "lucide-react";

<div className="flex items-center gap-1">
  <IconButton 
    icon={<Edit2 className="h-4 w-4" />}
    title="Edit"
    onClick={handleEdit}
    variant="edit"
  />
  <IconButton 
    icon={<Trash2 className="h-4 w-4" />}
    title="Delete"
    onClick={handleDelete}
    variant="delete"
  />
  <IconButton 
    icon={<Eye className="h-4 w-4" />}
    title="View"
    onClick={handleView}
    variant="view"
  />
</div>
```

### Inline Edit Actions
```tsx
{editing ? (
  <div className="flex gap-1">
    <IconButton 
      icon={<Check className="h-4 w-4" />}
      title="Save"
      onClick={handleSave}
      variant="add"
      loading={saving}
    />
    <IconButton 
      icon={<X className="h-4 w-4" />}
      title="Cancel"
      onClick={handleCancel}
      variant="ghost"
    />
  </div>
) : (
  <IconButton 
    icon={<Edit2 className="h-4 w-4" />}
    title="Edit"
    onClick={() => setEditing(true)}
    variant="edit"
  />
)}
```

### With Loading State
```tsx
<IconButton 
  icon={<Trash2 className="h-4 w-4" />}
  title="Delete"
  onClick={handleDelete}
  variant="delete"
  loading={isDeleting}
/>
```

## Text Buttons (CTAs & form submits)

For prominent/labelled actions use the shared `<Button>` (`components/ui/button.tsx`),
never a hand-rolled `<button className="bg-...">`:

| Intent | Variant |
|--------|---------|
| Primary action — Save, Create, Submit | `variant="primary"` (accent) |
| Secondary — Cancel, Back | `variant="outline"` or `"secondary"` |
| Destructive — Delete book, Remove | `variant="danger"` |

Pair with a leading lucide icon (`h-4 w-4 mr-1.5/mr-2`) where it aids scanning.

## Icon Conventions

| Icon | Usage |
|------|-------|
| `Edit2` or `Pencil` | Edit |
| `Trash2` | Delete |
| `Plus` | Add |
| `Check` | Save, Confirm |
| `X` | Cancel, Close |
| `Eye` | View, Preview |
| `Download` | Download, Export |
| `Copy` | Copy |
| `Share2` | Share |
| `Archive` | Archive |
| `MoreVertical` | More options |
| `ChevronUp` / `ChevronDown` | Move, Reorder |

## Guidelines

1. **Always provide tooltips** - Use the `title` prop for clarity
2. **Color code actions** - Users learn to expect destructive actions to be red
3. **Icon size** - Standard `h-4 w-4` for consistency
4. **Spacing** - Use `gap-1` between adjacent icon buttons
5. **Loading states** - Show spinner during async operations
6. **Don't mix** - Don't put text buttons and icon buttons in the same row

## Where NOT to Use Icons

- Primary CTAs (use text buttons instead)
- Form submissions like "Save Article" or "Create Book"
- Top-level navigation
- When user needs clear action label
- Prominent page-level actions

## Rolling Out

Pages to standardize (in priority order):
- [ ] ARCs
- [ ] Discount Codes
- [ ] Blog/Pages
- [ ] Flip Books
- [ ] Media Kit
- [ ] Messages
- [ ] Dashboard
