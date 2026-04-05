declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_BRAND_NAME?: string;

    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    /** Server-only; optional until trusted server jobs are needed */
    SUPABASE_SERVICE_ROLE_KEY?: string;

    /**
     * Portfolio work pages: `auto` | `supabase` | `static` (default auto).
     */
    PORTFOLIO_DATA?: string;

    /**
     * Comma-separated admin emails (lowercase match). Required for `/admin` when using allowlist.
     */
    ADMIN_EMAILS?: string;
    CONTACT_TO_EMAIL?: string;
    CONTACT_FROM_EMAIL?: string;
    RESEND_API_KEY?: string;
    NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
    TURNSTILE_SECRET_KEY?: string;
    /** Vercel: production | preview | development */
    VERCEL_ENV?: string;
    VERCEL?: string;
  }
}
