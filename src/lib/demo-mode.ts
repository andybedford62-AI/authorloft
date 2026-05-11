export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("demo");
}
