import { NextResponse } from "next/server";

/**
 * Safe error handler that sanitizes responses for production.
 * Never returns stack traces to clients — logs them server-side instead.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number = 500,
    message: string = "Internal server error",
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handle API errors safely (no stack traces to client)
 */
export function handleApiError(
  err: any,
  defaultMessage: string = "An error occurred. Please try again later."
): NextResponse {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  // Log full error server-side (always)
  const errorInfo = {
    name: err.name || "Error",
    message: err.message || String(err),
    ...(err.context && { context: err.context }),
  };

  console.error("[api-error]", JSON.stringify(errorInfo));

  // Send generic message to client in production
  const clientMessage =
    statusCode >= 500
      ? defaultMessage
      : err.message || "Invalid request";

  return NextResponse.json(
    {
      error: clientMessage,
      ...(isProduction ? {} : { details: err.message }),
    },
    { status: statusCode }
  );
}

/**
 * Wrap async route handlers for automatic error handling
 */
export function withErrorHandler(
  handler: (req: any) => Promise<NextResponse>
) {
  return async (req: any) => {
    try {
      return await handler(req);
    } catch (err: any) {
      return handleApiError(
        err instanceof ApiError ? err : new ApiError(500, String(err))
      );
    }
  };
}
