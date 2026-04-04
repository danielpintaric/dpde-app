import "server-only";

export class EnvConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvConfigError";
  }
}

export type MailDeliveryConfig =
  | {
      mode: "resend";
      apiKey: string;
      from: string;
      to: string;
    }
  | { mode: "unconfigured"; to: string };

/**
 * Liest die Mail-Konfiguration für den Kontakt-Endpunkt.
 * CONTACT_TO_EMAIL ist für sinnvolle Fehlertexte immer erforderlich.
 * Keine stillen Fallbacks: fehlt CONTACT_TO_EMAIL → throw (Route: 500).
 * Fehlt RESEND_API_KEY oder CONTACT_FROM_EMAIL → unconfigured (Route: 503 „Mail not configured“).
 */
export function getContactMailConfig(): MailDeliveryConfig {
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!to) {
    throw new EnvConfigError(
      "CONTACT_TO_EMAIL is not set. Set it in the environment (e.g. Vercel → Environment Variables).",
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return { mode: "unconfigured", to };
  }

  return { mode: "resend", apiKey, from, to };
}

/** Optional: für spätere Turnstile-Verifikation im Route Handler (Secret nur Server). */
export function getOptionalTurnstileSecret(): string | undefined {
  const s = process.env.TURNSTILE_SECRET_KEY?.trim();
  return s || undefined;
}
