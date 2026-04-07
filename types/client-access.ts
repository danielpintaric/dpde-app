/** Row shape from `public.client_access` (service-role reads). */
export type ClientAccessAdminRow = {
  id: string;
  site_id: string;
  token: string;
  client_name: string | null;
  project_ids: unknown;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};
