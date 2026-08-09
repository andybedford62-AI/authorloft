export function capturePostHog(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {}
) {
  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return;
  fetch(`${host}/capture/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ api_key: key, distinct_id: distinctId, event, properties }),
  }).catch(() => {});
}
