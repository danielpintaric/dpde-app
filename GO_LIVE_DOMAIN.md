# Go-Live: Domain (one.com) mit Vercel verbinden

Diese Anleitung beschreibt nur **Domain, DNS und Produktionskontext** — ohne Bezug zu UI/Code.

**Wichtig:** Konkrete DNS-Werte (Ziel-IPs, CNAME-Ziele, TTL) kommen **ausschließlich aus dem Vercel-Dashboard** für dein Projekt. Vercel ist die **Source of Truth**. Bei one.com trägst du **exakt dieselben** Werte ein, die Vercel dir anzeigt.

---

## 1. Domain in Vercel hinzufügen (Schritte)

1. Vercel-Dashboard öffnen → **dein Projekt** auswählen.
2. **Settings** → **Domains**.
3. Domain eintragen: zuerst z. B. `example.com`, dann optional `www.example.com` (oder beides nacheinander hinzufügen).
4. Vercel zeigt dir die **benötigten DNS-Einträge** (A/CNAME) und den Status (**Pending / Valid**).
5. Diese Angaben notieren — sie sind die Vorlage für one.com.

---

## 2. DNS-Struktur (Zielbild)

**Empfohlenes Ziel:**

- **Root-Domain (Apex):** `example.com` → zeigt auf Vercel (über die von Vercel geforderten **A-Records**).
- **www:** `www.example.com` → zeigt auf Vercel (über **CNAME**, Ziel laut Vercel), **oder** leitet in Vercel auf die **Primary Domain** um.

**Wann welcher Typ?**

| Situation | Typisch |
|-----------|---------|
| **Apex** (`example.com` ohne Subdomain) | **A-Record(s)** — Vercel gibt die **exakten** Ziel-Adressen vor. |
| **Subdomain** wie `www` | **CNAME** — Ziel ist das, was Vercel anzeigt (nicht raten). |

Parallel dürfen keine **widersprüchlichen** A/CNAME-Einträge für dieselbe Hostname-Zeile existieren (sonst bleibt die Domain „ungenau“ oder zeigt woandershin).

---

## 3. DNS bei one.com eintragen

**Wo findest du DNS?**

- Im **one.com Kundenbereich / Control Panel** zur **Domain** navigieren.
- Bereich wie **DNS-Einstellungen**, **DNS-Verwaltung**, **DNS-Records** oder **Nameserver & DNS** (Bezeichnung kann am Produkt slight abweichen).

**Was du tust:**

1. **Einträge aus Vercel** abarbeiten (gleiche Typen, gleiche Hostnamen [@, www, …], gleiche Ziele).
2. **Apex:** A-Record(s) für `@` (oder „Root“) setzen — **Werte 1:1 von Vercel**.
3. **www:** CNAME für `www` setzen — **Ziel 1:1 von Vercel**.
4. **Alte/widersprüchliche Einträge** für dieselbe Domain entfernen (z. B. ältere A-Records auf Webspace-Parking, falsche CNAMEs).
5. **Kein paralleler Webspace/hosting** nutzen, der dieselbe Domain „beansprucht“, wenn die Site ausschließlich auf Vercel laufen soll (sonst kollidieren Ziele oder Weiterleitungen).

**Hinweise:**

- **SSL:** Nach erfolgreicher DNS-Auflösung stellt Vercel das Zertifikat **automatisch** bereit (Kann einige Minuten bis länger dauern).
- **Propagation:** DNS-Änderungen sind nicht sofort weltweit gleich; oft **Minuten bis 24–48 h** — Geduld und erneut in Vercel prüfen.

---

## 4. Root vs. www & Primary Domain

- **Apex** = `example.com` (ohne `www`).
- **www** = Subdomain `www.example.com`.

**Empfehlung:**

- Im Vercel-Domain-Bereich eine **Primary Domain** wählen — entweder **nur Apex** oder **nur www** als Hauptadresse.
- Die andere Variante in Vercel so einrichten, dass sie **301 auf die Primary** weiterleitet (Redirect). So gibt es **keine doppelte Indexierung** ohne klare Canonical-URL (wichtig für SEO).

---

## 5. Checkliste nach Domain-Verbindung (Vercel)

- [ ] Domain(s) in Vercel **valid** (grün / konfiguriert).
- [ ] **SSL** aktiv (Vercel zeigt HTTPS).
- [ ] **Primary Domain** gesetzt, Redirect der zweiten Variante getestet.
- [ ] Seite lädt unter der **finalen** URL (Browser, inkognito).
- [ ] In Vercel **Environment Variables:** `NEXT_PUBLIC_SITE_URL` auf die **echte Produktionsdomain** setzen (nicht die `*.vercel.app`-URL), z. B. `https://example.com` oder `https://www.example.com` — **konsistent mit Primary Domain**.
- [ ] Anschließend **Redeploy** auslösen, damit Build/Metadaten die neue Basis-URL nutzen.

---

## 6. Produktionshinweis (`NEXT_PUBLIC_SITE_URL`)

Sobald die **Custom Domain** läuft, muss `NEXT_PUBLIC_SITE_URL` von einer temporären **vercel.app**-Adresse (oder einem alten Platzhalter) auf die **finale HTTPS-URL** umgestellt werden. Ohne das können u. a. **metadataBase**, **Sitemap** und **robots.txt** noch die falsche Basis verwenden.

---

## 7. Go-Live-Minicheckliste

- [ ] Domain in Vercel verbunden, DNS bei one.com wie von Vercel vorgegeben
- [ ] SSL aktiv
- [ ] Redirect Apex ↔ www wie gewünscht (Primary klar)
- [ ] `NEXT_PUBLIC_SITE_URL` auf finale Domain gesetzt
- [ ] Redeploy durchgeführt
- [ ] Kontaktformular unter der **echten Domain** getestet (200 + Mail)

---

## Weiterführend

Siehe auch `VERCEL_DEPLOYMENT.md` für Umgebungsvariablen und Deployment-Checks.
