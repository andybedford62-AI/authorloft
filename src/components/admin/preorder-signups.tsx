"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Send, Users } from "lucide-react";

type Signup = {
  id: string;
  email: string;
  name: string | null;
  notifiedAt: string | null;
  createdAt: string;
};

export function PreOrderSignups({ bookId }: { bookId: string }) {
  const [loading, setLoading]   = useState(true);
  const [signups, setSignups]   = useState<Signup[]>([]);
  const [total, setTotal]       = useState(0);
  const [notified, setNotified] = useState(0);
  const [sending, setSending]   = useState(false);
  const [result, setResult]     = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/books/${bookId}/preorder`);
    if (res.ok) {
      const data = await res.json();
      setSignups(data.signups ?? []);
      setTotal(data.total ?? 0);
      setNotified(data.notified ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pending = total - notified;

  async function handleNotify() {
    if (!confirm(`Send the launch email to ${pending} reader${pending === 1 ? "" : "s"} who signed up?`)) return;
    setSending(true);
    setResult("");
    const res = await fetch(`/api/admin/books/${bookId}/preorder`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setResult(`Sent to ${data.sent} of ${data.total} reader${data.total === 1 ? "" : "s"}.`);
      load();
    } else {
      setResult(data.error || "Something went wrong.");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading signups…
      </div>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            Pre-order Signups
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Readers who asked to be notified when this book launches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            <strong>{total}</strong> signup{total === 1 ? "" : "s"}
            {notified > 0 && <span className="text-gray-400"> · {notified} notified</span>}
          </span>
          <button
            type="button"
            onClick={handleNotify}
            disabled={sending || pending === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
              : <><Send className="h-3.5 w-3.5" />Send Launch Email{pending > 0 ? ` (${pending})` : ""}</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {result}
        </div>
      )}

      {signups.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Mail className="h-4 w-4" />
          No signups yet. Once your "Coming Soon" page is live, reader emails will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Signed up</th>
                <th className="px-2 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {signups.map((s) => (
                <tr key={s.id}>
                  <td className="px-2 py-2 text-gray-700">{s.email}</td>
                  <td className="px-2 py-2 text-gray-500">{s.name || "—"}</td>
                  <td className="px-2 py-2 text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-2 py-2">
                    {s.notifiedAt ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Notified</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
