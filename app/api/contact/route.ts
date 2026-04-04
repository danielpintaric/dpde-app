import { NextResponse } from "next/server";
import { logServerError } from "@/lib/server-log";
import { EnvConfigError, getContactMailConfig } from "@/lib/server-env";

const MAX_LEN = {
  name: 200,
  email: 320,
  project: 300,
  message: 8000,
} as const;

type ContactPayload = {
  name: string;
  email: string;
  project: string;
  message: string;
  turnstileToken?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

/** Einfache Prüfung ohne zusätzliche Abhängigkeit */
function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendViaResend(params: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  textBody: string;
}): Promise<{ ok: true } | { ok: false; status: number; detail: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      reply_to: params.replyTo,
      subject: params.subject,
      text: params.textBody,
    }),
  });

  if (res.ok) {
    return { ok: true };
  }

  let detail = res.statusText || "Resend request failed";
  try {
    const errJson = (await res.json()) as { message?: string };
    if (errJson?.message) detail = errJson.message;
  } catch {
    /* ignore */
  }

  return { ok: false, status: res.status, detail };
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Content-Type. Use application/json." },
      { status: 415 },
    );
  }

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected application/json." },
      { status: 400 },
    );
  }

  const body = bodyUnknown as Partial<ContactPayload>;
  const name = isNonEmptyString(body.name) ? clip(body.name.trim(), MAX_LEN.name) : "";
  const email = isNonEmptyString(body.email) ? clip(body.email.trim(), MAX_LEN.email) : "";
  const project = typeof body.project === "string" ? clip(body.project.trim(), MAX_LEN.project) : "";
  const message = isNonEmptyString(body.message) ? clip(body.message.trim(), MAX_LEN.message) : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in name, email, and message." },
      { status: 400 },
    );
  }

  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // TODO (2B): Wenn TURNSTILE_SECRET_KEY gesetzt ist, body.turnstileToken gegen Cloudflare verifizieren
  // und bei Fehlschlag 403 zurückgeben. Dazu Turnstile-Widget im Client ergänzen (NEXT_PUBLIC_TURNSTILE_SITE_KEY).

  let mailConfig;
  try {
    mailConfig = getContactMailConfig();
  } catch (e) {
    const msg = e instanceof EnvConfigError ? e.message : "Server configuration error.";
    logServerError("contact", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (mailConfig.mode === "unconfigured") {
    return NextResponse.json(
      {
        error:
          "Mail not configured. Set RESEND_API_KEY and CONTACT_FROM_EMAIL in the environment (e.g. Vercel).",
      },
      { status: 503 },
    );
  }

  const subjectLine = project
    ? `Contact: ${project} — ${name}`
    : `Contact — ${name}`;

  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    project ? `Brief: ${project}` : null,
    "",
    message,
    "",
    `— Sent via website contact form`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const sent = await sendViaResend({
      apiKey: mailConfig.apiKey,
      from: mailConfig.from,
      to: mailConfig.to,
      replyTo: email,
      subject: clip(subjectLine, 998),
      textBody,
    });

    if (!sent.ok) {
      logServerError("contact", "Resend request failed", {
        httpStatus: sent.status,
        detail: sent.detail,
      });
      return NextResponse.json(
        { error: "The mail provider rejected the request. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    logServerError("contact", "Unexpected error while sending", {
      detail: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { error: "Unexpected server error while sending. Please try again later." },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
