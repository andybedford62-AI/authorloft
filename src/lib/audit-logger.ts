import { NextRequest } from "next/server";

export interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  action: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  userAgent?: string;
  statusCode?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log sensitive API operations for forensics and abuse detection.
 * In production, logs are sent to Vercel logs (searchable via CLI).
 */
export function auditLog(entry: Omit<AuditLogEntry, "timestamp">): void {
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Format as JSON for easy parsing in Vercel logs
  console.log(
    JSON.stringify({
      level: "AUDIT",
      ...logEntry,
    })
  );
}

/**
 * Extract audit context from request
 */
export function getAuditContext(req: NextRequest) {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown",
    userAgent: req.headers.get("user-agent") || undefined,
  };
}

/**
 * Sensitive endpoints that should be logged
 */
export const AUDITED_ROUTES = {
  // Checkout & payments
  "/api/checkout": {
    methods: ["POST"],
    action: "Create checkout session",
    includeMetadata: true,
  },

  // Admin operations
  "/api/admin/books": {
    methods: ["POST", "PUT", "DELETE"],
    action: "Manage book",
    includeMetadata: true,
  },
  "/api/admin/discount-codes": {
    methods: ["POST", "PUT", "DELETE"],
    action: "Manage discount codes",
    includeMetadata: true,
  },
  "/api/admin/branding": {
    methods: ["POST", "PUT"],
    action: "Update branding",
    includeMetadata: false,
  },
  "/api/admin/settings": {
    methods: ["POST", "PUT"],
    action: "Update settings",
    includeMetadata: false,
  },
  "/api/admin/stripe/connect": {
    methods: ["POST"],
    action: "Configure Stripe Connect",
    includeMetadata: true,
  },
  "/api/admin/stripe/subscribe": {
    methods: ["POST"],
    action: "Create subscription",
    includeMetadata: true,
  },
  "/api/admin/upload/cover": {
    methods: ["POST"],
    action: "Upload book cover",
    includeMetadata: false,
  },

  // Authentication
  "/api/auth/register": {
    methods: ["POST"],
    action: "User registration",
    includeMetadata: false,
  },
  "/api/auth/resend-verification": {
    methods: ["POST"],
    action: "Resend verification email",
    includeMetadata: false,
  },

  // Orders & downloads
  "/api/orders/download": {
    methods: ["GET"],
    action: "Download file",
    includeMetadata: true,
  },

  // Webhooks (for debugging)
  "/api/stripe/webhook": {
    methods: ["POST"],
    action: "Stripe webhook",
    includeMetadata: true,
  },
};

/**
 * Check if route should be audited
 */
export function shouldAuditRoute(pathname: string, method: string): boolean {
  for (const [route, config] of Object.entries(AUDITED_ROUTES)) {
    if (pathname.startsWith(route) && config.methods.includes(method)) {
      return true;
    }
  }
  return false;
}

/**
 * Get audit action for route
 */
export function getAuditAction(pathname: string): string {
  for (const [route, config] of Object.entries(AUDITED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return config.action;
    }
  }
  return "API request";
}

/**
 * Helper to extract metadata from request body (sensitive data redacted)
 */
export function extractMetadata(
  body: any,
  shouldInclude: boolean
): Record<string, unknown> | undefined {
  if (!shouldInclude || !body) return undefined;

  // Only include non-sensitive fields
  const safe: Record<string, unknown> = {};

  if (body.bookId) safe.bookId = body.bookId;
  if (body.saleItemId) safe.saleItemId = body.saleItemId;
  if (body.saleItemIds) safe.saleItemIds = body.saleItemIds;
  if (body.discountCodeId) safe.discountCodeId = body.discountCodeId;
  if (body.priceId) safe.priceId = body.priceId;
  if (body.amount || body.amountCents) safe.amount = body.amountCents || body.amount;
  if (body.code) safe.code = "(redacted)"; // Don't log actual discount codes
  if (body.email) safe.email = "(redacted)"; // Email is PII

  return Object.keys(safe).length > 0 ? safe : undefined;
}
