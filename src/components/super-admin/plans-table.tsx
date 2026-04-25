"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  slug: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  maxBooks: number | null;
  maxPosts: number | null;
  maxStorageMb: number | null;
  customDomain: boolean;
  salesEnabled: boolean;
  newsletter: boolean;
  analyticsEnabled: boolean;
  badgeColor: string;
  featuredLabel: string | null;
  isActive: boolean;
  isDefault: boolean;
  _count: { subscriptions: number };
};

const BADGE: Record<string, string> = {
  gray:   "bg-gray-100 text-gray-700",
  blue:   "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  gold:   "bg-yellow-100 text-yellow-700",
};

function fmt(cents: number) {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

const Check = () => (
  <svg className="h-4 w-4 text-emerald-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const Cross = () => (
  <svg className="h-4 w-4 text-gray-300 mx-auto" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

export function PlansTable({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function toggleActive(plan: Plan) {
    setLoadingId(plan.id);
    await fetch(`/api/super-admin/plans/${plan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function deletePlan(id: string) {
    setDeletingId(id);
    await fetch(`/api/super-admin/plans/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmDelete(null);
    router.refresh();
  }

  return (
    <>
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Delete this plan?</h3>
            <p className="text-sm text-gray-500 mb-6">This cannot be undone. Authors on this plan must be reassigned manually.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
              <button onClick={() => deletePlan(confirmDelete)} disabled={deletingId === confirmDelete} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50">
                {deletingId === confirmDelete ? "Deleting…" : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 overflow-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Monthly / Annual</th>
              <th className="px-4 py-3 font-medium">Books</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 font-medium">Storage</th>
              <th className="px-4 py-3 font-medium text-center">Domain</th>
              <th className="px-4 py-3 font-medium text-center">Sales</th>
              <th className="px-4 py-3 font-medium text-center">Newsletter</th>
              <th className="px-4 py-3 font-medium text-center">Analytics</th>
              <th className="px-4 py-3 font-medium text-center">Subs</th>
              <th className="px-4 py-3 font-medium text-center">Active</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((plan) => (
              <tr key={plan.id} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[plan.badgeColor] ?? BADGE.gray}`}>{plan.name}</span>
                    {plan.isDefault && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Default</span>}
                    {plan.featuredLabel && <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">{plan.featuredLabel}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{plan.slug}</p>
                </td>
                <td className="px-4 py-4 text-gray-700">
                  <div>{fmt(plan.monthlyPriceCents)}<span className="text-gray-400 text-xs">/mo</span></div>
                  {plan.annualPriceCents > 0 && <div className="text-xs text-gray-400">{fmt(plan.annualPriceCents)}/yr</div>}
                </td>
                <td className="px-4 py-4 text-gray-700">{plan.maxBooks === null ? "∞" : plan.maxBooks}</td>
                <td className="px-4 py-4 text-gray-700">{plan.maxPosts === null ? "∞" : plan.maxPosts}</td>
                <td className="px-4 py-4 text-gray-700">
                  {plan.maxStorageMb === null ? "∞" : plan.maxStorageMb >= 1000 ? `${(plan.maxStorageMb / 1000).toFixed(0)} GB` : `${plan.maxStorageMb} MB`}
                </td>
                <td className="px-4 py-4">{plan.customDomain ? <Check /> : <Cross />}</td>
                <td className="px-4 py-4">{plan.salesEnabled ? <Check /> : <Cross />}</td>
                <td className="px-4 py-4">{plan.newsletter ? <Check /> : <Cross />}</td>
                <td className="px-4 py-4">{plan.analyticsEnabled ? <Check /> : <Cross />}</td>
                <td className="px-4 py-4 text-center text-gray-700 font-medium">{plan._count.subscriptions}</td>
                <td className="px-4 py-4 text-center">
                  <button onClick={() => toggleActive(plan)} disabled={loadingId === plan.id}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${plan.isActive ? "bg-purple-600" : "bg-gray-200"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${plan.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 justify-end">
                    <Link href={`/super-admin/plans/${plan.id}`} className="text-xs text-purple-600 hover:text-purple-500">Edit</Link>
                    <button onClick={() => setConfirmDelete(plan.id)} disabled={plan._count.subscriptions > 0}
                      title={plan._count.subscriptions > 0 ? "Cannot delete — authors are on this plan" : "Delete"}
                      className="text-xs text-red-500 hover:text-red-400 disabled:opacity-30">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                No plans yet. <Link href="/super-admin/plans/new" className="text-purple-600 hover:underline">Create your first plan →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}