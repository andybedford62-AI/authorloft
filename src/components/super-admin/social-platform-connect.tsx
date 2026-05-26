"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Trash2, Plus, ExternalLink } from "lucide-react";

type Token = {
  id:             string;
  platform:       string;
  accountId:      string;
  accountName:    string;
  tokenExpiresAt: string | null;
  isActive:       boolean;
  updatedAt:      string;
};

const PLATFORMS = [
  {
    id:          "LINKEDIN",
    label:       "LinkedIn",
    color:       "bg-blue-700",
    textColor:   "text-blue-700",
    borderColor: "border-blue-200",
    bgLight:     "bg-blue-50",
    idLabel:     "LinkedIn Member ID",
    idHint:      "Auto-detected from your access token",
    tokenHint:   "Access token from LinkedIn Developer Portal (w_member_social scope)",
    docsUrl:     "https://www.linkedin.com/developers/apps",
    autoId:      true,  // ID is fetched automatically from the token
  },
  {
    id:          "FACEBOOK",
    label:       "Facebook",
    color:       "bg-blue-600",
    textColor:   "text-blue-600",
    borderColor: "border-blue-200",
    bgLight:     "bg-blue-50",
    idLabel:     "Page ID",
    idHint:      "Facebook Page ID (found in Page settings → About)",
    tokenHint:   "Page access token from Facebook Developer Portal",
    docsUrl:     "https://developers.facebook.com/apps",
  },
  {
    id:          "INSTAGRAM",
    label:       "Instagram",
    color:       "bg-pink-600",
    textColor:   "text-pink-600",
    borderColor: "border-pink-200",
    bgLight:     "bg-pink-50",
    idLabel:     "Instagram User ID",
    idHint:      "Instagram Business Account ID (from Graph API Explorer)",
    tokenHint:   "Facebook Page access token (same token works for linked IG)",
    docsUrl:     "https://developers.facebook.com/apps",
  },
] as const;

function ConnectPanel({
  platformDef,
  onSuccess,
}: {
  platformDef: (typeof PLATFORMS)[number];
  onSuccess:   () => void;
}) {
  const [accountId,   setAccountId]   = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  const autoId = "autoId" in platformDef && platformDef.autoId;

  async function handleConnect() {
    if (!autoId && !accountId.trim()) {
      setError("Both fields are required.");
      return;
    }
    if (!accessToken.trim()) {
      setError("Access token is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/super-admin/social/tokens", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ platform: platformDef.id, accessToken, accountId: autoId ? undefined : accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connect failed");
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono";

  return (
    <div className={`mt-3 p-4 rounded-lg border ${platformDef.borderColor} ${platformDef.bgLight} space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Connect {platformDef.label}</p>
        <a href={platformDef.docsUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          Developer Portal <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1.5">{error}</p>}

      {autoId ? (
        <p className="text-xs text-gray-500 bg-white rounded px-3 py-2 border border-gray-200">
          ℹ️ Your LinkedIn Member ID will be detected automatically from your access token.
        </p>
      ) : (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">{platformDef.idLabel}</label>
          <input type="text" value={accountId} onChange={(e) => setAccountId(e.target.value)}
            placeholder={platformDef.idHint} className={inputCls} />
        </div>
      )}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600">Access Token</label>
        <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)}
          placeholder={platformDef.tokenHint} className={inputCls} />
      </div>

      <button
        onClick={handleConnect}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Testing & Connecting…</> : "Connect"}
      </button>
      {autoId && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1.5">
          Posts to your personal LinkedIn profile. Company Page API requires a LinkedIn partnership.
        </p>
      )}
      <p className="text-xs text-gray-400">The token will be tested before saving. It is stored encrypted.</p>
    </div>
  );
}

export function SocialPlatformConnect({ initialTokens }: { initialTokens: Token[] }) {
  const [tokens,   setTokens]   = useState<Token[]>(initialTokens);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDisconnect(platform: string) {
    if (!confirm(`Disconnect ${platform}? Scheduled posts to this platform may fail.`)) return;
    setDeleting(platform);
    try {
      await fetch(`/api/super-admin/social/tokens/${platform}`, { method: "DELETE" });
      setTokens((prev) => prev.filter((t) => t.platform !== platform));
      router.refresh();
    } catch {
      alert("Failed to disconnect. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function handleSuccess() {
    setOpenPanel(null);
    router.refresh();
    // Re-fetch tokens
    fetch("/api/super-admin/social/tokens")
      .then((r) => r.json())
      .then(setTokens)
      .catch(() => {});
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700">Connected Platforms</h2>
        <p className="text-xs text-gray-400 mt-0.5">Connect AuthorLoft&apos;s own social accounts to post marketing content.</p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map((plat) => {
          const token     = tokens.find((t) => t.platform === plat.id);
          const connected = !!token;
          const isOpen    = openPanel === plat.id;

          return (
            <div key={plat.id}>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold ${plat.color}`}>
                    {plat.label[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plat.label}</p>
                    {connected ? (
                      <p className="text-xs text-gray-400">{token.accountName}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Not connected</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <button
                        onClick={() => handleDisconnect(plat.id)}
                        disabled={deleting === plat.id}
                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Disconnect"
                      >
                        {deleting === plat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setOpenPanel(isOpen ? null : plat.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Connect
                    </button>
                  )}
                </div>
              </div>

              {isOpen && !connected && (
                <ConnectPanel platformDef={plat} onSuccess={handleSuccess} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
