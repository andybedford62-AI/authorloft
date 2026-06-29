"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookMarked, Copy, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BooksListClient } from "./books-list-client";
import { BookShelfPicker } from "./book-shelf-picker";
import { ArcsOverview } from "./arcs-overview";
import { SpecialsListClient } from "@/components/admin/specials-list-client";
import { cn } from "@/lib/utils";

type Tab = "my-books" | "book-shelf" | "arcs" | "specials";

type SpecialRow = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

type BookRow = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  directSalesEnabled: boolean;
  listInBookstore: boolean;
  isPreOrder: boolean;
  caption: string | null;
  series: { name: string } | null;
  _count: { directSaleItems: number; retailerLinks: number };
};

interface Props {
  books:       BookRow[];
  booksLayout: string;
  planTier:    string;
  specials:    SpecialRow[];
}

const TAB_IDS: Tab[] = ["my-books", "book-shelf", "arcs", "specials"];

export function AdminBooksTabsClient({ books, booksLayout, planTier, specials }: Props) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as Tab | null;
  const initialTab: Tab =
    requestedTab && TAB_IDS.includes(requestedTab) ? requestedTab : "my-books";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "my-books",    label: "My Books",   icon: BookOpen   },
    { id: "book-shelf",  label: "Book Shelf",  icon: BookMarked },
    { id: "arcs",        label: "ARC",        icon: Copy       },
    { id: "specials",    label: "Specials",   icon: Sparkles   },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "my-books" && (
        books.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No books yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Add your first book to get started.</p>
            <Link href="/admin/books/new">
              <Button>Add Your First Book</Button>
            </Link>
          </div>
        ) : (
          <BooksListClient initialBooks={books} />
        )
      )}

      {activeTab === "book-shelf" && (
        <BookShelfPicker currentLayout={booksLayout} planTier={planTier} />
      )}

      {activeTab === "arcs" && (
        <ArcsOverview books={books} />
      )}

      {activeTab === "specials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {specials.length === 0
                ? "Promotions, limited-time deals, signed copies, and bundles."
                : `${specials.length} special${specials.length !== 1 ? "s" : ""} — ${
                    specials.filter(
                      (s) => s.isActive && (!s.endsAt || new Date(s.endsAt) > new Date())
                    ).length
                  } active`}
            </p>
            <Link href="/admin/specials/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Special
              </Button>
            </Link>
          </div>
          <SpecialsListClient specials={specials} />
        </div>
      )}
    </div>
  );
}
