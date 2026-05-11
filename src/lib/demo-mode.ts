export function isDemoMode(hostname: string | undefined): boolean {
  if (!hostname) return false;
  return hostname.includes("demo.authorloft.com") || hostname.includes("localhost:3000");
}
