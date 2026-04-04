# Vercel: Environment Variables & Deployment

## Setze folgende Variablen in Vercel → Settings → Environment Variables

**Production:** alle Variablen unten (inkl. Mail) setzen.  
**Preview:** mindestens die `NEXT_PUBLIC_*` Variablen setzen; Mail-Variablen optional (ohne sie liefert `/api/contact` **503**).

Copy-Paste-Vorlage (Platzhalter ersetzen, keine Secrets committen):

```env
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain-or-custom-domain>
NEXT_PUBLIC_BRAND_NAME=Daniel Pintarić

CONTACT_TO_EMAIL=<your-email>
CONTACT_FROM_EMAIL=noreply@<your-domain>
RESEND_API_KEY=re_xxxxx
```

Optional (vorbereitet, im Code noch nicht aktiv):

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Nach Änderungen an Environment Variables: **Redeploy** auslösen (Deployments → … → Redeploy), damit der Build/Laufzeit die neuen Werte nutzt.

---

## Resend (kurz)

1. Domain bei [Resend](https://resend.com) verifizieren.
2. `CONTACT_FROM_EMAIL` muss eine Adresse **auf dieser verifizierten Domain** sein (oder eine von Resend freigegebene Test-Adresse in der Entwicklung).

---

## Deployment-Check

1. Redeploy auslösen.
2. **`/contact`** öffnen, Formular absenden ( gültige Felder ).
3. **Erfolg:** Response **200**, Mail bei `CONTACT_TO_EMAIL` ankommen.
4. **Fehlerfälle (API `POST /api/contact`):**
   - **500** → `CONTACT_TO_EMAIL` fehlt oder anderer Server-Konfigurationsfehler.
   - **503** → Mail nicht konfiguriert (`RESEND_API_KEY` und/oder `CONTACT_FROM_EMAIL` fehlt).

---

## Offene Erweiterungen (TODO)

- **Cloudflare Turnstile:** Site Key + Secret setzen, Widget im Kontaktformular, serverseitige Verifikation in `app/api/contact/route.ts`.
- **Rate limiting / Abuse-Schutz** (z. B. Edge-Middleware, Vercel Firewall, oder externer Dienst).
