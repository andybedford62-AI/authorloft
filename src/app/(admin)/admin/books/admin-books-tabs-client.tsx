"use client";

import { useState } from "react";
import { BookOpen, BookMarked } from "lucide-react";
import { BooksListClient } from "./books-list-client";
import { BookShelfPicker } from "./book-shelf-picker";
import { cn } from "@/lib/utils";

type Tab = "my-books" | "book-shelf";

type BookRow = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  caption: string | null;
  series: { name: string } | null;
  _count: { directSaleItems: number; retailerLinks: number };
};

interface Props {
  books:       BookRow[];
  booksLayout: string;
  planTier:    string;
}

export function AdminBooksTabsClient({ books, booksLayout, planTier }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("my-books");

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "my-books",    label: "My Books",   icon: BookOpen   },
    { id: "book-shelf",  label: "Book Shelf",  icon: BookMarked },
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
            <a href="/admin/books/new">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Add Your First Book
              </button>
            </a>
          </div>
        ) : (
          <BooksListClient initialBooks={books} />
        )
      )}

      {activeTab === "book-shelf" && (
        <BookShelfPicker currentLayout={booksLayout} planTier={planTier} />
      )}
    </div>
  );
}
