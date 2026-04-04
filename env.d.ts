declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_BRAND_NAME?: string;
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
