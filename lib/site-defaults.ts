/**
 * Default tenant for single-site deployments and `/admin/site` until host-based routing exists.
 */
export const DEFAULT_SITE_ID = "default" as const;

export type SiteId = string;
