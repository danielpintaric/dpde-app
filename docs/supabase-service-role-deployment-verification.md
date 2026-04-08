# Supabase Service-Role: Deploy-Abgleich (Vercel)

Nach dem Production-Fix sind die ausführlichen `[env-check]`‑, Role- und Match-Zeilen in `createSupabaseServiceRoleClient()` entfernt. Verbleibend: eine **Warnung** bei zu kurzem Key (`[env-check] service-role-suspicious-length`), plus **`logServerError`** bei fehlendem/ungültigem Key (ohne Secrets). Für manche Download-Pfade zusätzlich `logSupabaseServiceRoleProductionDiagnostics` (Present/Länge/Vercel-Env).

## A. Vorgehen in Production / Preview / Development

1. **Gleichen Pfad wie lokal anstoßen** (nach Admin-Login, falls nötig): bevorzugt **`GET /admin/client-access`**. Alternativ jeder Request, der sicher `createSupabaseServiceRoleClient()` ausführt (z. B. Client-Download mit gültigem Token).
2. In **Vercel** → Project → **Logs** (Runtime / Function-Logs zur **gleichen** Request-Zeit wie der Test-Request).
3. Im Log prüfen:
   - Erscheint **`[env-check] service-role-suspicious-length`** → Key zu kurz (z. B. 41 Zeichen); Vercel-Variable prüfen (CASE **B/C**).
   - **`[scope] service_role key present: … · length: …`** (nur Production, einige Pfade): Länge sollte **≥ ~200** (typisch ~219) sein.
   - Bei Fehlkonfiguration: Eintrag **`supabase-service-role`** (`Invalid or missing service role key` + `present`/`length`/`VERCEL_ENV`).
4. Erwartung bei korrektem Production-Key: **keine** `service-role-suspicious-length`-Zeile, Seite/API ohne 503 „invalid/missing service role“.

## B. Einordnung (CASE)

| Deployed-Log | CASE | Bedeutung |
|----------------|------|------------|
| `service-role-present=false` oder `service-role-length=0` | **A** | `SUPABASE_SERVICE_ROLE_KEY` fehlt in **diesem** Vercel-Scope (Production ≠ Preview ≠ Development). |
| `role=anon` | **B** | Unter `SUPABASE_SERVICE_ROLE_KEY` liegt der Anon- (oder anderer falscher) Key. |
| `parse=failed` (bzw. `role=n/a` mit parse failed) oder Warnung **service-role-suspicious-length** | **C** | Key in Vercel beschädigt/truncated/falscher Typ (z. B. kurzer Nicht-JWT-Wert, Zeilenumbruch, Quotes). |
| Symptom: 503 bzw. Storage/Admin bricht; Key-Länge ok aber falsches Projekt | **D** | `NEXT_PUBLIC_SUPABASE_URL` (Build-Zeit) und Service-Role-Key aus **verschiedenen** Supabase-Projekten — ausrichten, redeploy. |
| Kein suspicious-length, keine Service-Role-503, aber anderes Problem | **E** | Env am Messpunkt ok → Route, Deployment, Branch prüfen. |

## C. Nächste Aktion pro CASE

| CASE | Maßnahme |
|------|-----------|
| **A** | `SUPABASE_SERVICE_ROLE_KEY` im **richtigen** Vercel-Environment-Scope setzen; Production, Preview und Development **einzeln** prüfen; **neu deployen**. |
| **B** | Wert durch echtes **service_role**-Secret aus Supabase Dashboard → API ersetzen; **neu deployen**. |
| **C** | Variable in Vercel **löschen und neu anlegen**; ohne Anführungszeichen/extra Zeilenumbruch; Secret vollständig kopieren; **neu deployen**. |
| **D** | URL und Key aus **demselben** Supabase-Projekt; `NEXT_PUBLIC_*` ist **Build-Zeit** — nach URL-Wechsel **Rebuild + Deploy**. |
| **E** | Sicherstellen, dass der **fehlschlagende** Request dieselbe Route ist; kein **stale** Deployment; Branch/Env in Vercel; danach erst andere Ursachen. |

## D. Code-Audit (Kurz)

- Intern: `SUPABASE_SERVICE_ROLE_KEY is not a valid service_role key for server-side storage operations`
- Öffentlich (503): `Service unavailable: SUPABASE_SERVICE_ROLE_KEY must be the service_role secret …`

→ Nur in **`lib/db/supabase-service-role.ts`**. Ein Validierungsort für diese Fehlerfamilie.

## E. Hinweis

Wenn lokal gut und deployt schlecht, ist die **wahrscheinlichste** Erklärung eine **andere** Variable/Scope/Kopie in Vercel — `service-role-suspicious-length` bzw. `length` in den Production-Diagnostics und 503-Meldungen zeigen das schnell.
