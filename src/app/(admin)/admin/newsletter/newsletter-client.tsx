"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download, Users, Mail, Tag, Send, Eye, EyeOff,
  CheckCircle, XCircle, Loader2, History, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type Subscriber = {
  id:            string;
  name:          string | null;
  email:         string;
  categoryPrefs: string[];
  isConfirmed:   boolean;
  subscribedAt:  string;
};

type Genre = { id: string; name: string };

type Campaign = {
  id:            string;
  subject:       string;
  sentAt:        string;
  totalSent:     number;
  totalFailed:   number;
  totalTargeted: number;
};

interface Props {
  subscribers:    Subscriber[];
  genres:         Genre[];
  genreMap:       Record<string, string>;
  confirmedCount: number;
  accentColor:    string;
  authorName:     string;
  campaigns:      Campaign[];
}

type SendResult = { sent: number; failed: number; total: number } | null;
type Tab = "subscribers" | "compose" | "history";

export function NewsletterClient({
  subscribers,
  genres,
  genreMap,
  confirmedCount,
  accentColor,
  authorName,
  campaigns: initialCampaigns,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("subscribers");

  // Compose state
  const [subject,        setSubject]        = useState("");
  const [htmlBody,       setHtmlBody]       = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showPreview,    setShowPreview]    = useState(false);
  const [sendState,      setSendState]      = useState<"idle" | "confirming" | "sending" | "done">("idle");
  const [sendResult,     setSendResult]     = useState<SendResult>(null);
  const [sendError,      setSendError]      = useState("");

  // History — updated optimistically after each send
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  const targetCount =
    categoryFilter.length === 0
      ? confirmedCount
      : subscribers.filter(
          (s) =>
            s.isConfirmed &&
            (s.categoryPrefs.length === 0 ||
              s.categoryPrefs.some((p) => categoryFilter.includes(p)))
        ).length;

  function toggleCategory(id: string) {
    setCategoryFilter((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSend() {
    setSendState("sending");
    setSendError("");

    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subject, htmlBody, categoryFilter }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error || "Failed to send campaign.");
        setSendState("idle");
      } else {
        setSendResult(data);
        setSendState("done");
        // Refresh campaign history from server
        router.refresh();
        // Also add optimistically to local state so History tab shows it immediately
        setCampaigns((prev) => [{
          id:            crypto.randomUUID(),
          subject,
          sentAt:        new Date().toISOString(),
          totalSent:     data.sent,
          totalFailed:   data.failed,
          totalTargeted: data.total,
        }, ...prev]);
      }
    } catch {
      setSendError("Network error. Please try again.");
      setSendState("idle");
    }
  }

  function resetCompose() {
    setSubject("");
    setHtmlBody("");
    setCategoryFilter([]);
    setShowPreview(false);
    setSendResult(null);
    setSendState("idle");
    setSendError("");
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {confirmedCount} confirmed subscriber{confirmedCount !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="/api/admin/newsletter/export" download>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: subscribers.length,                                          icon: Users   },
          { label: "Confirmed",         value: confirmedCount,                                              icon: Mail    },
          { label: "Campaigns Sent",    value: campaigns.length,                                            icon: History },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["subscribers", "compose", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "compose" ? "Compose & Send" : t === "history" ? "History" : "Subscribers"}
          </button>
        ))}
      </div>

      {/* ── Subscribers tab ───────────────────────────────────────────── */}
      {tab === "subscribers" && (
        <>
          {subscribers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="font-medium text-gray-500">No subscribers yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Readers can sign up through the newsletter form on your site.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-4 text-xs text-gray-500 uppercase tracking-wide font-medium">
                  <span>Subscriber</span>
                  <span>Email</span>
                  <span>Interests</span>
                  <span>Joined</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {subscribers.map((sub) => {
                  const interestNames = sub.categoryPrefs
                    .map((id) => genreMap[id])
                    .filter(Boolean);
                  return (
                    <div
                      key={sub.id}
                      className="grid grid-cols-4 px-5 py-3 items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {sub.name || "—"}
                        </span>
                        {sub.isConfirmed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Confirmed" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500 truncate">{sub.email}</span>
                      <div className="flex flex-wrap gap-1">
                        {interestNames.length > 0 ? (
                          interestNames.map((name) => (
                            <Badge key={name} variant="default" className="text-xs">{name}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-300">None</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Compose & Send tab ────────────────────────────────────────── */}
      {tab === "compose" && (
        <>
          {/* Done state */}
          {sendState === "done" && sendResult && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center space-y-4">
              {sendResult.failed === 0 ? (
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-12 w-12 text-amber-500 mx-auto" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Campaign sent!</h2>
                <p className="text-gray-500 mt-1">
                  <span className="font-medium text-green-600">{sendResult.sent} delivered</span>
                  {sendResult.failed > 0 && (
                    <span className="ml-2 text-amber-600">· {sendResult.failed} failed</span>
                  )}
                  <span className="text-gray-400"> of {sendResult.total} total</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={resetCompose}>
                  Compose another
                </Button>
                <Button variant="outline" onClick={() => setTab("history")}>
                  <History className="h-4 w-4 mr-2" />
                  View history
                </Button>
              </div>
            </div>
          )}

          {/* Compose form */}
          {sendState !== "done" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <h2 className="font-semibold text-gray-900">Compose Campaign</h2>

                <Input
                  label="Subject Line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New release: The Deep Dark — available now!"
                  disabled={sendState === "sending"}
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email Body</label>
                  <RichTextEditor
                    value={htmlBody}
                    onChange={setHtmlBody}
                    placeholder="Write your newsletter here…"
                  />
                </div>

                {genres.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Send to</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Leave blank to send to all confirmed subscribers. Select categories to
                        target readers with those interests (subscribers with no preference are
                        always included).
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {genres.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleCategory(g.id)}
                          disabled={sendState === "sending"}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            categoryFilter.includes(g.id)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {htmlBody && htmlBody !== "<p></p>" && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPreview ? "Hide preview" : "Preview email"}
                    </span>
                  </button>

                  {showPreview && (
                    <div className="border-t border-gray-100">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 space-y-1">
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="font-medium w-12">From:</span>
                          <span>{authorName} via AuthorLoft</span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="font-medium w-12">Subject:</span>
                          <span className="font-medium text-gray-800">
                            {subject || <em>No subject</em>}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="rounded-xl overflow-hidden border border-gray-100" style={{ maxWidth: 560 }}>
                          <div className="px-8 py-6" style={{ backgroundColor: accentColor }}>
                            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Newsletter from</p>
                            <p className="text-xl font-bold text-white">{authorName}</p>
                          </div>
                          <div
                            className="bg-white px-8 py-7 prose prose-sm max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: htmlBody }}
                          />
                          <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 text-center">
                            <p className="text-xs text-gray-400">
                              You&apos;re receiving this because you subscribed to updates from {authorName}.
                            </p>
                            <p className="text-xs mt-2">
                              <span className="text-gray-400 underline">Unsubscribe</span>
                              {" · "}
                              <span className="text-gray-400 underline">Visit site</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sendError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {sendError}
                </p>
              )}

              {sendState === "confirming" ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Send className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Send to {targetCount} subscriber{targetCount !== 1 ? "s" : ""}?
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Subject: <span className="font-medium text-gray-700">{subject}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Sent from: {authorName} via AuthorLoft &lt;noreply@authorloft.com&gt;
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSend} disabled={!subject.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Yes, send now
                    </Button>
                    <Button variant="outline" onClick={() => setSendState("idle")}>Cancel</Button>
                  </div>
                </div>
              ) : sendState === "sending" ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="font-medium text-gray-900">Sending campaign…</p>
                    <p className="text-sm text-gray-500">
                      Sending to {targetCount} subscriber{targetCount !== 1 ? "s" : ""}. Please keep this page open.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => setSendState("confirming")}
                    disabled={!subject.trim() || !htmlBody.trim() || htmlBody === "<p></p>" || targetCount === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Campaign
                    {targetCount > 0 && (
                      <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                        {targetCount}
                      </span>
                    )}
                  </Button>
                  <p className="text-sm text-gray-400">
                    {targetCount === 0
                      ? "No confirmed subscribers to send to."
                      : `Will send to ${targetCount} confirmed subscriber${targetCount !== 1 ? "s" : ""}.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── History tab ───────────────────────────────────────────────── */}
      {tab === "history" && (
        <>
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <History className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="font-medium text-gray-500">No campaigns sent yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Once you send a campaign, it will appear here.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setTab("compose")}>
                Compose your first campaign
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-4 text-xs text-gray-500 uppercase tracking-wide font-medium">
                  <span className="col-span-2">Subject</span>
                  <span>Date Sent</span>
                  <span>Results</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {campaigns.map((c) => {
                  const allDelivered = c.totalFailed === 0;
                  const deliveryRate = c.totalTargeted > 0
                    ? Math.round((c.totalSent / c.totalTargeted) * 100)
                    : 0;
                  return (
                    <div key={c.id} className="grid grid-cols-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors">
                      <div className="col-span-2 pr-4">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.subject}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(c.sentAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {allDelivered ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.totalSent} / {c.totalTargeted}
                          </p>
                          <p className="text-xs text-gray-400">{deliveryRate}% delivered</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
