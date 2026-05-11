# Admin Icon Button Standardization Guide

## Philosophy
- **Text buttons** for primary CTAs and form submissions (Add, Save, Cancel at top level)
- **Icon buttons** for compact spaces: data table rows, inline actions, dense UIs
- **Consistent styling** across all icon buttons with color coding

## Icon Button Variants & Colors

| Variant | Use Case | Color |
|---------|----------|-------|
| `edit` (blue) | Edit, Pencil actions | Blue → Darker blue on hover |
| `add` (green) | Plus, Add, Create new | Green → Darker green on hover |
| `delete` (red) | Trash, Delete, Remove | Red → Darker red on hover |
| `view` (black) | Eye, View, Preview | Black → Darker gray on hover |
| `ghost` (gray) | Secondary, More, Cancel | Gray → Darker gray on hover |

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
      variant="success"
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
    variant="primary"
  />
)}
```

### With Loading State
```tsx
<IconButton 
  icon={<Trash2 className="h-4 w-4" />}
  title="Delete"
  onClick={handleDelete}
  variant="danger"
  loading={isDeleting}
/>
```

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
