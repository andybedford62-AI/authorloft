import {
  LayoutDashboard,
  BarChart2,
  BookOpen,
  BookMarked,
  Tag,
  Sparkles,
  Library,
  Palette,
  Paintbrush,
  Mail,
  Inbox,
  ShoppingBag,
  Settings,
  Users,
  CreditCard,
  FileText,
  Newspaper,
  Shield,
  BookText,
  Bot,
  Search,
  Megaphone,
  Receipt,
  HelpCircle,
  Scale,
  Globe,
  Ticket,
  Star,
  Share2,
  FolderTree,
  Download,
  SlidersHorizontal,
  Send,
  Award,
  Layers,
  ListChecks,
  Package,
  GraduationCap,
} from "lucide-react";

// Nav data shared between the sidebar and the command-palette search — a
// single source of truth so the two never drift out of sync.

export interface NavItem {
  href:      string;
  label:     string;
  icon:      React.ElementType;
  external?: boolean;
  exact?:    boolean; // active-state match is pathname === href, not startsWith
}

export interface NavGroup {
  key:         string;
  label:       string;
  defaultOpen: boolean;
  items:       NavItem[];
}

export const ADMIN_PINNED_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics",  icon: BarChart2      },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "catalog", label: "Catalog", defaultOpen: true,
    items: [
      { href: "/admin/books",      label: "Books",      icon: BookOpen      },
      { href: "/admin/series",     label: "Series",     icon: Library       },
      { href: "/admin/flip-books", label: "Flip Books", icon: BookMarked    },
      { href: "/admin/bundles",    label: "Bundles",    icon: Package       },
      { href: "/admin/courses",    label: "Courses",    icon: GraduationCap },
      { href: "/admin/specials",   label: "Specials",   icon: Sparkles      },
    ],
  },
  {
    key: "website", label: "Website", defaultOpen: true,
    items: [
      { href: "/admin/pages",          label: "Pages",          icon: FileText   },
      { href: "/admin/blog",           label: "Blog",           icon: Newspaper  },
      { href: "/admin/search-engines", label: "Search Engines", icon: Globe      },
      { href: "/admin/appearance",     label: "Appearance",     icon: Paintbrush },
      { href: "/admin/branding",       label: "Branding",       icon: Palette    },
      { href: "/admin/legal",          label: "Legal Pages",    icon: Scale      },
    ],
  },
  {
    key: "audience", label: "Audience", defaultOpen: false,
    items: [
      { href: "/admin/messages",   label: "Messages",          icon: Inbox     },
      { href: "/admin/feedback",   label: "Reader Feedback",   icon: Star      },
      { href: "/admin/newsletter", label: "Newsletter",          icon: Mail     },
      { href: "/admin/media-kit",  label: "Media Kit",         icon: Megaphone },
    ],
  },
  {
    key: "sales", label: "Sales", defaultOpen: false,
    items: [
      { href: "/admin/sales",          label: "Sales",          icon: ShoppingBag },
      { href: "/admin/discount-codes", label: "Discount Codes", icon: Tag         },
      { href: "/admin/invoices",       label: "Invoices & Tax", icon: Receipt     },
    ],
  },
  {
    key: "tools", label: "Tools", defaultOpen: false,
    items: [
      { href: "/admin/promote",      label: "Promote",      icon: Send   },
      { href: "/admin/ai-assistant", label: "AI Assistant", icon: Bot    },
      { href: "/admin/seo-audit",    label: "SEO Audit",    icon: Search },
    ],
  },
  {
    key: "account", label: "Account", defaultOpen: false,
    items: [
      { href: "/admin/settings",   label: "Settings",            icon: Settings   },
      { href: "/admin/compliance", label: "Reader Privacy (GDPR)", icon: Shield   },
      { href: "/admin/help",       label: "Help & Support",      icon: HelpCircle },
    ],
  },
];

export const SUPER_ADMIN_PINNED_ITEMS: NavItem[] = [
  { href: "/super-admin", label: "Platform Dashboard", icon: LayoutDashboard, exact: true },
];

export const SUPER_ADMIN_GROUPS: NavGroup[] = [
  {
    key: "sa-authors", label: "Authors", defaultOpen: true,
    items: [
      { href: "/super-admin/authors",         label: "All Authors",     icon: Users },
      { href: "/super-admin/access-requests", label: "Access Requests", icon: Inbox },
    ],
  },
  {
    key: "sa-billing", label: "Billing & Plans", defaultOpen: false,
    items: [
      { href: "/super-admin/plans",          label: "Plans",         icon: CreditCard        },
      { href: "/super-admin/coupons",        label: "Coupons",       icon: Ticket            },
      { href: "/super-admin/feature-config", label: "Feature Gates", icon: SlidersHorizontal },
      { href: "/super-admin/badges",         label: "Achievement Badges", icon: Award        },
    ],
  },
  {
    key: "sa-marketing", label: "Marketing", defaultOpen: false,
    items: [
      { href: "/super-admin/blog",               label: "Blog & News",        icon: Newspaper },
      { href: "/super-admin/subscribers",        label: "News Subscribers",   icon: Mail      },
      { href: "/super-admin/guides",             label: "Guides",             icon: BookText   },
      { href: "/super-admin/resources",          label: "Resources",          icon: Globe     },
      { href: "/super-admin/resource-downloads", label: "Resource Downloads", icon: Download   },
      { href: "/super-admin/categories",         label: "Content Categories", icon: FolderTree },
      { href: "/super-admin/social",             label: "Social Media",       icon: Share2     },
      { href: "/super-admin/faqs",               label: "FAQs",               icon: HelpCircle },
    ],
  },
  {
    key: "sa-social-promote", label: "Social Promote", defaultOpen: false,
    items: [
      { href: "/super-admin/social-promote/platforms",   label: "Platforms",       icon: Share2     },
      { href: "/super-admin/social-promote/promo-types", label: "Promo Types",     icon: Layers     },
      { href: "/super-admin/social-promote/prompts",     label: "Prompts & Test",  icon: Sparkles   },
      { href: "/super-admin/social-promote/log",         label: "Generation Log",  icon: ListChecks },
      { href: "/super-admin/social-promote/settings",    label: "Settings",        icon: Settings   },
    ],
  },
  {
    key: "sa-platform", label: "Platform", defaultOpen: false,
    items: [
      { href: "/admin/genres",           label: "Genres",             icon: Tag        },
      { href: "/admin/course-categories",label: "Course Categories",  icon: GraduationCap },
      { href: "/super-admin/help",       label: "Help Articles",      icon: HelpCircle },
      { href: "/super-admin/legal",      label: "Platform Legal",     icon: Shield     },
      { href: "/super-admin/settings",   label: "Platform Settings",  icon: Settings   },
    ],
  },
];
