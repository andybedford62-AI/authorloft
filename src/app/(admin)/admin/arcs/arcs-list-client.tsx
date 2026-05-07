"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

type ArcEntry = {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string | null;
  fileName: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  counts: {
    total: number;
    invited: number;
    downloaded: number;
    reviewed: number;
    pending: number;
  };
};

function StatusBadge({ isActive, expiresAt }: { isActive: boolean; expiresAt: string | null }) {
  const expired = expiresAt && new Date(expiresAt) < new Date();
  if (!isActive || expired) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
        Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      Active
    </span>
  );
}

export function ArcsListClient({ arcs }: { arcs: ArcEntry[] }) {
  const router = useRouter();

  if (arcs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-base font-medium text-gray-500">No ARCs yet</p>
        <p className="text-sm mt-1">
          Go to a book and open the <strong>ARCs</strong> tab to upload your first advance copy.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-600">Book</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">Invited</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600 hidden sm:table-cell">Downloaded</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600 hidden sm:table-cell">Reviewed</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600 hidden md:table-cell">Pending</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Expires</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {arcs.map((arc) => (
            <tr
              key={arc.id}
              onClick={() => router.push(`/admin/books/${arc.bookId}/edit?tab=arcs`)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {arc.bookCover ? (
                    <Image
                      src={arc.bookCover}
                      alt={arc.bookTitle}
                      width={28}
                      height={40}
                      className="rounded object-cover flex-shrink-0"
                      style={{ width: 28, height: 40 }}
                    />
                  ) : (
                    <div className="w-7 h-10 rounded bg-gray-200 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[160px]">{arc.bookTitle}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{arc.fileName}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge isActive={arc.isActive} expiresAt={arc.expiresAt} />
              </td>
              <td className="px-4 py-3 text-center">
                <span className="font-medium text-gray-700">{arc.counts.invited + arc.counts.downloaded + arc.counts.reviewed}</span>
              </td>
              <td className="px-4 py-3 text-center hidden sm:table-cell">
                <span className="font-medium text-blue-600">{arc.counts.downloaded}</span>
              </td>
              <td className="px-4 py-3 text-center hidden sm:table-cell">
                <span className="font-medium text-green-600">{arc.counts.reviewed}</span>
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                <span className="font-medium text-amber-600">{arc.counts.pending}</span>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                {arc.expiresAt
                  ? new Date(arc.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "No expiry"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
