"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Loader2, Plug, PlugZap } from "lucide-react";

type Provider = "KIT" | "MAILCHIMP" | "ACTIVECAMPAIGN" | "";

const PROVIDERS = [
  {
    id: "KIT" as const,
    name: "Kit (ConvertKit)",
    description: "Connect your Kit account to sync new subscribers automatically.",
    extraLabel: null,
    extraPlaceholder: null,
    docsUrl: "https://app.kit.com/account_settings/developer_settings",
  },
  {
    id: "MAILCHIMP" as const,
    name: "Mailchimp",
    description: "Sync subscribers to a Mailchimp audience.",
    extraLabel: "Audience ID",
    extraPlaceholder: "e.g. a1b2c3d4e5",
    docsUrl: "https://mailchimp.com/help/about-api-keys/",
  },
  {
    id: "ACTIVECAMPAIGN" as const,
    name: "ActiveCampaign",
    description: "Add subscribers to your ActiveCampaign account.",
    extraLabel: "Account URL",
    extraPlaceholder: "e.g. https://myaccount.api-us1.com",
    docsUrl: "https://help.activecampaign.com/hc/en-us/articles/207317590-Getting-started-with-the-API",
  },
];

export default function NewsletterIntegrationPage() {
  const [provider,  setProvider]  = useState<Provider>("");
  const [apiKey,    setApiKey]    = useState("");
  const [extra,     setExtra]     = useState("");
  const [hasKey,    setHasKey]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [testing,   setTesting]   = useState(false);
  const [status,    setStatus]    = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter-integration")
      .then((r) => r.json())
      .then((data) => {
        setProvider(data.provider ?? "");
        setHasKey(data.hasKey ?? false);
        setExtra(data.extra ?? "");
        if (data.hasKey) setApiKey("••••••••");
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/newsletter-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider || null,
          apiKey: apiKey || null,
          extra: extra || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Save failed");
      setStatus({ type: "success", message: "Integration saved." });
      setHasKey(!!apiKey && apiKey !== "");
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/newsletter-integration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, extra }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Connection failed");
      const accountName = json.error; // reused field for account name display
      setStatus({
        type: "success",
        message: accountName
          ? `Connected successfully — account: ${accountName}`
          : "Connection successful!",
      });
    } catch (e: any) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setTesting(false);
    }
  }

  async function handleDisconnect() {
    setSaving(true);
    setStatus(null);
    try {
      await fetch("/api/admin/newsletter-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: null, apiKey: null, extra: null }),
      });
      setProvider("");
      setApiKey("");
      setExtra("");
      setHasKey(false);
      setStatus({ type: "success", message: "Integration disconnected." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Marketing Integration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your email marketing service to automatically sync new subscribers.
        </p>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            status.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {status.type === "success"
            ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Provider selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Choose a provider</h2>
        <div className="grid gap-3">
          {PROVIDERS.map((p) => (
            <label
              key={p.id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                provider === p.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => {
                  setProvider(p.id);
                  setStatus(null);
                  if (provider !== p.id) {
                    setApiKey("");
                    setExtra("");
                    setHasKey(false);
                  }
                }}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
              </div>
            </label>
          ))}
          <label
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              provider === ""
                ? "border-gray-400 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="provider"
              value=""
              checked={provider === ""}
              onChange={() => { setProvider(""); setStatus(null); }}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-gray-700 text-sm">None</p>
              <p className="text-xs text-gray-500 mt-0.5">Don&apos;t sync to an external service.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Credentials form */}
      {selectedProvider && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {selectedProvider.name} credentials
            </h2>
            <a
              href={selectedProvider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Where to find your API key →
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onFocus={() => { if (apiKey === "••••••••") setApiKey(""); }}
                placeholder={hasKey ? "Enter new key to replace" : "Paste your API key"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedProvider.extraLabel && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {selectedProvider.extraLabel}
                </label>
                <input
                  type="text"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder={selectedProvider.extraPlaceholder ?? ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleTest}
              disabled={testing || (!apiKey && !hasKey)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testing
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <PlugZap className="h-4 w-4" />}
              Test connection
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Plug className="h-4 w-4" />}
              Save integration
            </button>
          </div>
        </div>
      )}

      {/* Disconnect */}
      {!selectedProvider && hasKey && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            You have an active integration configured. Select &ldquo;None&rdquo; above and save to disconnect it.
          </p>
          <button
            onClick={handleDisconnect}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Disconnect integration
          </button>
        </div>
      )}

      {/* Save when no provider selected */}
      {!selectedProvider && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </button>
        </div>
      )}

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">How it works</p>
        <p className="text-xs leading-relaxed">
          When a reader subscribes to your newsletter on your author site, they are added to your
          AuthorLoft subscriber list <em>and</em> automatically synced to your connected email service.
          Existing subscribers are not retroactively synced — only new sign-ups from this point on.
        </p>
      </div>
    </div>
  );
}
