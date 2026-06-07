import { Share2 } from "lucide-react";
import { SocialLinksPanel } from "@/components/super-admin/social-links-panel";

export const metadata = {
  title: "Social Media - AuthorLoft Admin",
  description: "Manage company social media links",
};

export default function SocialMediaPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-5 w-5 text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">Social Media</h1>
        </div>
        <p className="text-gray-600">
          Manage AuthorLoft's official social media links. Changes appear on all marketing pages.
        </p>
      </div>

      {/* Social Links Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SocialLinksPanel />
      </div>
    </div>
  );
}
