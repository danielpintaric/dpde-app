import { AdminAppHeaderClient } from "@/components/admin/admin-app-header-client";
import { getResolvedSiteGlobal } from "@/lib/services/site-global";

/**
 * Opaker Admin-Header (secure): Brand links, nur Admin-Navigation.
 * Unter lg: kompakte Leiste und Drawer; ab lg: klassische horizontale Nav.
 */
export async function AdminAppHeader() {
  const { brandName } = await getResolvedSiteGlobal();
  return <AdminAppHeaderClient brandName={brandName} />;
}
