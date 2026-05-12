export type EmailProvider = "KIT" | "MAILCHIMP" | "ACTIVECAMPAIGN";

export interface SyncResult {
  ok: boolean;
  error?: string;
}

// ── Kit (ConvertKit) ──────────────────────────────────────────────────────────
// API v4 — https://developers.kit.com/v4

async function syncToKit(
  apiKey: string,
  email: string,
  name?: string
): Promise<SyncResult> {
  const res = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ email_address: email, first_name: name ?? "" }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `Kit error ${res.status}: ${text}` };
  }
  return { ok: true };
}

export async function testKitConnection(apiKey: string): Promise<SyncResult> {
  const res = await fetch("https://api.kit.com/v4/account", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return { ok: false, error: "Invalid API key or connection failed." };
  const json = await res.json();
  return { ok: true, error: json?.account?.name ?? undefined };
}

// ── Mailchimp ─────────────────────────────────────────────────────────────────
// Marketing API v3 — https://mailchimp.com/developer/marketing/api/

function mailchimpServer(apiKey: string): string {
  // API keys end with "-us1", "-eu1", etc.
  return apiKey.split("-").pop() ?? "us1";
}

async function syncToMailchimp(
  apiKey: string,
  listId: string,
  email: string,
  name?: string
): Promise<SyncResult> {
  const server = mailchimpServer(apiKey);
  const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");
  const nameParts = (name ?? "").trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName  = nameParts.slice(1).join(" ");

  const res = await fetch(
    `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: { FNAME: firstName, LNAME: lastName },
      }),
    }
  );

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    // 400 with "Member Exists" is fine — already subscribed
    if (json?.title === "Member Exists") return { ok: true };
    return { ok: false, error: json?.detail ?? `Mailchimp error ${res.status}` };
  }
  return { ok: true };
}

export async function testMailchimpConnection(
  apiKey: string,
  listId: string
): Promise<SyncResult> {
  const server = mailchimpServer(apiKey);
  const auth   = Buffer.from(`anystring:${apiKey}`).toString("base64");

  const res = await fetch(
    `https://${server}.api.mailchimp.com/3.0/lists/${listId}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) return { ok: false, error: "Invalid API key or Audience ID." };
  const json = await res.json();
  return { ok: true, error: json?.name ?? undefined }; // returns list name as "error" field (reused for display)
}

// ── ActiveCampaign ────────────────────────────────────────────────────────────
// API v3 — https://developers.activecampaign.com/reference

async function syncToActiveCampaign(
  apiKey: string,
  accountUrl: string,
  email: string,
  name?: string
): Promise<SyncResult> {
  const base = accountUrl.replace(/\/$/, "");
  const nameParts = (name ?? "").trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName  = nameParts.slice(1).join(" ");

  const res = await fetch(`${base}/api/3/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Token": apiKey,
    },
    body: JSON.stringify({
      contact: { email, firstName, lastName },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `ActiveCampaign error ${res.status}: ${text}` };
  }
  return { ok: true };
}

export async function testActiveCampaignConnection(
  apiKey: string,
  accountUrl: string
): Promise<SyncResult> {
  const base = accountUrl.replace(/\/$/, "");
  const res  = await fetch(`${base}/api/3/users/me`, {
    headers: { "Api-Token": apiKey },
  });
  if (!res.ok) return { ok: false, error: "Invalid API key or account URL." };
  const json = await res.json();
  return { ok: true, error: json?.user?.email ?? undefined };
}

// ── Public sync dispatcher ────────────────────────────────────────────────────

export async function syncSubscriberToProvider(
  provider: EmailProvider,
  apiKey: string,
  extra: string | null,
  email: string,
  name?: string
): Promise<SyncResult> {
  try {
    switch (provider) {
      case "KIT":
        return await syncToKit(apiKey, email, name);
      case "MAILCHIMP":
        if (!extra) return { ok: false, error: "Audience ID not configured." };
        return await syncToMailchimp(apiKey, extra, email, name);
      case "ACTIVECAMPAIGN":
        if (!extra) return { ok: false, error: "Account URL not configured." };
        return await syncToActiveCampaign(apiKey, extra, email, name);
    }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Unknown error" };
  }
}
