"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Link2 } from "lucide-react";
import { SocialPlatformConnect } from "@/components/super-admin/social-platform-connect";
import { SocialPostsClient } from "@/components/super-admin/social-posts-client";
import { SocialLinksPanel } from "@/components/super-admin/social-links-panel";

type TabId = "posting" | "links";

interface SocialTabsProps {
  tokens: any[];
  posts: any[];
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "posting", label: "Post Content", icon: MessageSquare },
  { id: "links",   label: "Company Links", icon: Link2 },
];

export function SocialTabs({ tokens, posts }: SocialTabsProps) {
  const [active, setActive] = useState<TabId>("posting");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-3 -mb-px border-b-2 font-medium text-sm transition-colors ${
              active === id
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Post Content tab */}
      {active === "posting" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Post Content</h2>
              <p className="text-sm text-gray-500 mt-1">
                Post AuthorLoft marketing content to LinkedIn, Facebook, and Instagram.
              </p>
            </div>
            <Link
              href="/super-admin/social/new"
              className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              + New Post
            </Link>
          </div>

          <SocialPlatformConnect initialTokens={tokens} />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Posts</h3>
            <SocialPostsClient initialPosts={posts} />
          </div>
        </div>
      )}

      {/* Company Links tab */}
      {active === "links" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Company Social Links</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage AuthorLoft&apos;s official social media links shown in the marketing footer.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SocialLinksPanel />
          </div>
        </div>
      )}
    </div>
  );
}
