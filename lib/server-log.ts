import "server-only";
import { isProductionDeploy } from "@/lib/server-deployment";

/**
 * Production-safe: keine Provider-Rohfehler oder Request-Inhalte loggen.
 */
export function logServerError(
  scope: string,
  message: string,
  context?: { httpStatus?: number; detail?: string },
): void {
  if (isProductionDeploy()) {
    console.error(`[${scope}]`, message, context?.httpStatus ?? "");
    return;
  }
  console.error(`[${scope}]`, message, context?.detail ?? context?.httpStatus ?? "");
}

export function logServerWarning(scope: string, message: string): void {
  console.warn(`[${scope}]`, message);
}
