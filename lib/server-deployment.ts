import "server-only";

export type VercelDeploymentEnv = "production" | "preview" | "development";

/**
 * Vercel setzt VERCEL_ENV zur Laufzeit (Server).
 * Lokal / andere Hosts: typischerweise undefined.
 */
export function getVercelDeploymentEnv(): VercelDeploymentEnv | undefined {
  const v = process.env.VERCEL_ENV;
  if (v === "production" || v === "preview" || v === "development") {
    return v;
  }
  return undefined;
}

export function isPreviewDeploy(): boolean {
  return getVercelDeploymentEnv() === "preview";
}

export function isProductionDeploy(): boolean {
  return getVercelDeploymentEnv() === "production";
}
